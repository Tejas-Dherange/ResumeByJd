import { ParsedResume, OptimizedResumeContent } from '../types/resume.types';
import { geminiClient } from '../llm/gemini.client';
import { PROMPTS } from '../llm/promptTemplates';
import { extractTechnicalKeywords } from '../utils/tokenizer';

/**
 * Hallucination Validator Service
 * Ensures optimized resume doesn't add false information
 */
class HallucinationValidatorService {

    /**
     * Validate that optimized resume doesn't introduce new skills/technologies
     * 
     * Returns:
     * - isValid: true if no hallucinations detected
     * - addedSkills: array of new skills found (if any)
     * - message: explanation
     */
    async validate(
        original: ParsedResume,
        optimized: OptimizedResumeContent
    ): Promise<{ isValid: boolean; addedSkills: string[]; message: string }> {
        try {
            // Extract skills from both versions
            const originalSkills = this.extractSkills(original);
            const optimizedSkills = this.extractSkills({ sections: optimized.sections, metadata: original.metadata });

            // Find new skills in optimized version
            const addedSkills = optimizedSkills.filter(skill =>
                !originalSkills.some(orig =>
                    orig.toLowerCase() === skill.toLowerCase()
                )
            );

            // Use LLM for additional validation
            const llmValidation = await this.llmValidate(original, optimized);

            // Combine both validations
            const allAddedSkills = [...new Set([...addedSkills, ...llmValidation.addedSkills])];

            const isValid = allAddedSkills.length === 0;

            return {
                isValid,
                addedSkills: allAddedSkills,
                message: isValid
                    ? 'No hallucinations detected. Resume optimization is valid.'
                    : `Hallucinations detected: Added ${allAddedSkills.length} new skills/technologies: ${allAddedSkills.join(', ')}`
            };
        } catch (error) {
            throw new Error(`Failed to validate resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Extract technical skills from resume
     */
    private extractSkills(resume: ParsedResume): string[] {
        const fullText = resume.sections
            .map(s => `${s.title} ${s.content.join(' ')}`)
            .join(' ');

        return extractTechnicalKeywords(fullText);
    }

    /**
     * Use LLM to detect hallucinations
     */
    private async llmValidate(
        original: ParsedResume,
        optimized: OptimizedResumeContent
    ): Promise<{ isValid: boolean; addedSkills: string[]; message: string }> {
        try {
            const originalJSON = JSON.stringify(original.sections);
            const optimizedJSON = JSON.stringify(optimized.sections);

            const result = await geminiClient.generateJSON<{
                isValid: boolean;
                addedSkills: string[];
                message: string;
            }>(
                PROMPTS.validateHallucination.user(originalJSON, optimizedJSON),
                PROMPTS.validateHallucination.system,
                0.1 // Very low temperature for strict validation
            );

            return result;
        } catch (error) {
            console.error('LLM validation error:', error);
            // If LLM fails, return conservative result
            return {
                isValid: false,
                addedSkills: [],
                message: 'LLM validation failed, manual review recommended'
            };
        }
    }

    /**
     * Quick validation check - compares word counts and structure
     */
    validateStructure(original: ParsedResume, optimized: OptimizedResumeContent): boolean {
        // Check same number of sections
        if (original.sections.length !== optimized.sections.length) {
            return false;
        }

        // Check section titles match
        for (let i = 0; i < original.sections.length; i++) {
            if (original.sections[i].title !== optimized.sections[i].title) {
                return false;
            }
        }

        // Check content arrays have same length (or similar)
        for (let i = 0; i < original.sections.length; i++) {
            const origLen = original.sections[i].content.length;
            const optLen = optimized.sections[i].content.length;

            // Allow ±1 difference (some bullets might be merged/split)
            if (Math.abs(origLen - optLen) > 1) {
                return false;
            }
        }

        return true;
    }
}

export const hallucinationValidatorService = new HallucinationValidatorService();
