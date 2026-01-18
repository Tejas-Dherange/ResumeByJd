import { GapAnalysis, JobRequirements } from '../types/jd.types';
import { ParsedResume } from '../types/resume.types';
import { calculateKeywordFrequency, normalizeText } from '../utils/tokenizer';
import { geminiClient } from '../llm/gemini.client';
import { PROMPTS } from '../llm/promptTemplates';

/**
 * Gap Analysis Service
 * Compares resume content against JD requirements to identify gaps
 */
class GapAnalysisService {

    /**
     * Perform gap analysis between resume and job requirements
     * 
     * Classifies each keyword as:
     * - present: Mentioned 3+ times or in prominent sections
     * - weak: Mentioned 1-2 times
     * - missing: Not mentioned at all
     */
    async analyzeGap(resume: ParsedResume, requirements: JobRequirements): Promise<GapAnalysis> {
        try {
            // Combine all resume text
            const resumeText = this.extractFullText(resume);

            // Use Gemini to classify keywords with semantic understanding
            const classification = await geminiClient.generateJSON<{
                present: string[];
                weak: string[];
                missing: string[];
            }>(
                PROMPTS.classifyKeywordStrength.user(resumeText, requirements),
                PROMPTS.classifyKeywordStrength.system
            );

            const present = classification.present || [];
            const weak = classification.weak || [];
            const missing = classification.missing || [];

            // Calculate coverage
            const mustHaveSkills = Object.keys(requirements.must_have);
            const niceToHaveSkills = Object.keys(requirements.nice_to_have);
            
            const mustHavePresent = mustHaveSkills.filter(k =>
                present.includes(k) || weak.includes(k)
            ).length;
            const niceToHavePresent = niceToHaveSkills.filter(k =>
                present.includes(k) || weak.includes(k)
            ).length;

            const mustHavePercent = mustHaveSkills.length > 0
                ? (mustHavePresent / mustHaveSkills.length) * 100
                : 100;

            const niceToHavePercent = niceToHaveSkills.length > 0
                ? (niceToHavePresent / niceToHaveSkills.length) * 100
                : 100;

            const overall = (mustHavePercent * 0.7 + niceToHavePercent * 0.3); // Must-have weighted more

            console.log("gap analysis");
            
            console.log({
                present,
                weak,
                missing,
                coverage: {
                    mustHavePercent: Math.round(mustHavePercent),
                    niceToHavePercent: Math.round(niceToHavePercent),
                    overall: Math.round(overall)
                }
            });
            
            return {
                present,
                weak,
                missing,
                coverage: {
                    mustHavePercent: Math.round(mustHavePercent),
                    niceToHavePercent: Math.round(niceToHavePercent),
                    overall: Math.round(overall)
                }
            };
        } catch (error) {
            throw new Error(`Failed to analyze gap: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Extract all text from resume sections
     */
    private extractFullText(resume: ParsedResume): string {
        return resume.sections
            .map(section => {
                const title = section.title;
                const content = section.content.join(' ');
                return `${title} ${content}`;
            })
            .join(' ');
    }
}

export const gapAnalysisService = new GapAnalysisService();
