import { ParsedResume, OptimizedResumeContent } from '../types/resume.types';
import { geminiClient } from '../llm/gemini.client';
import { PROMPTS } from '../llm/promptTemplates';

/**
 * Resume Rewrite Service
 * Uses LLM to optimize resume content while maintaining structure
 */
class ResumeRewriteService {

    /**
     * Rewrite resume to strengthen weak keywords
     * 
     * CRITICAL CONSTRAINTS:
     * - Only rephrase existing content
     * - NEVER add new skills/tools not in original
     * - Maintain exact section structure
     * - Emphasize weak keywords more prominently
     */
    async rewriteResume(
        originalResume: ParsedResume,
        weakKeywords: string[]
    ): Promise<OptimizedResumeContent> {
        try {
            console.log('📝 Resume Rewrite Started:', {
                totalSections: originalResume.sections.length,
                weakKeywords: weakKeywords.length,
                keywords: weakKeywords
            });

            // If no weak keywords, return original
            if (weakKeywords.length === 0) {
                console.log('⚠️ No weak keywords found, returning original resume');
                return {
                    sections: originalResume.sections,
                    changedSections: [],
                    metadata: {
                        optimizedAt: new Date(),
                        model: 'gemini-2.5-flash'
                    }
                };
            }

            // Convert resume to JSON string for LLM
            const resumeJSON = JSON.stringify(originalResume.sections, null, 2);

            console.log('📤 Sending to Gemini:', {
                resumeLength: resumeJSON.length,
                weakKeywords
            });

            // Call LLM to optimize
            const optimizedSections = await geminiClient.generateJSON<any>(
                PROMPTS.rewriteResume.user(resumeJSON, weakKeywords),
                PROMPTS.rewriteResume.system,
                0.2 // Very low temperature for consistency
            );

            console.log('📥 Received from Gemini:', {
                isArray: Array.isArray(optimizedSections),
                length: Array.isArray(optimizedSections) ? optimizedSections.length : 'not array',
                type: typeof optimizedSections
            });

            // Validate response structure
            if (!Array.isArray(optimizedSections)) {
                console.error('❌ Invalid response format - not an array');
                throw new Error('Invalid response format from LLM');
            }

            // Identify changed sections
            const changedSections: string[] = [];

            for (let i = 0; i < originalResume.sections.length; i++) {
                const original = JSON.stringify(originalResume.sections[i].content);
                const optimized = JSON.stringify(optimizedSections[i]?.content || []);

                if (original !== optimized) {
                    changedSections.push(originalResume.sections[i].title);
                }
            }

            console.log('✅ Optimization Complete:', {
                changedSections: changedSections.length,
                sections: changedSections
            });

            return {
                sections: optimizedSections,
                changedSections,
                metadata: {
                    optimizedAt: new Date(),
                    model: 'gemini-2.5-flash'
                }
            };
        } catch (error) {
            console.error('❌ Resume rewrite error:', error);
            throw new Error(`Failed to rewrite resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Strengthen specific bullets that contain weak keywords
     * More targeted approach than full rewrite
     */
    async strengthenBullets(
        sections: any[],
        weakKeywords: string[]
    ): Promise<any[]> {
        const strengthenedSections = JSON.parse(JSON.stringify(sections)); // Deep copy

        for (const section of strengthenedSections) {
            if (!section.content || !Array.isArray(section.content)) continue;

            for (let i = 0; i < section.content.length; i++) {
                const bullet = section.content[i].toLowerCase();

                // Check if this bullet contains any weak keywords
                const hasWeakKeyword = weakKeywords.some(kw =>
                    bullet.includes(kw.toLowerCase())
                );

                if (hasWeakKeyword) {
                    // Strengthen this bullet
                    section.content[i] = await this.strengthenSingleBullet(
                        section.content[i],
                        weakKeywords
                    );
                }
            }
        }

        return strengthenedSections;
    }

    /**
     * Strengthen a single bullet point
     */
    private async strengthenSingleBullet(
        bullet: string,
        weakKeywords: string[]
    ): Promise<string> {
        try {
            const prompt = `Rewrite this resume bullet to be stronger and more impactful. 
Emphasize these keywords: ${weakKeywords.join(', ')}

Original bullet:
${bullet}

Rules:
- Use strong action verbs (Built, Developed, Implemented, Architected, etc.)
- Add quantifiable metrics if possible
- Make it more concise and impactful
- DO NOT add new technologies or skills
- Keep it to one sentence

Respond with ONLY the improved bullet point, no explanation.`;

            const improved = await geminiClient.generateText(prompt, undefined, 0.3);

            return improved.trim() || bullet; // Fallback to original if empty
        } catch (error) {
            console.error('Error strengthening bullet:', error);
            return bullet; // Return original on error
        }
    }
}

export const resumeRewriteService = new ResumeRewriteService();
