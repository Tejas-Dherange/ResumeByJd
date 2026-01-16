import { ParsedJD, JobRequirements } from '../types/jd.types';
import { geminiClient } from '../llm/gemini.client';
import { PROMPTS } from '../llm/promptTemplates';

/**
 * Job Description Parser Service
 * Extracts structured requirements from job description text using LLM
 */
class JDParserService {

    /**
     * Parse job description text and extract requirements
     * 
     * Uses Gemini to classify skills into:
     * - must_have: Required skills explicitly mentioned
     * - nice_to_have: Preferred but optional skills
     */
    async parseJD(jdText: string): Promise<ParsedJD> {
        try {
            // Validate input
            if (!jdText || jdText.trim().length === 0) {
                throw new Error('Job description text cannot be empty');
            }

            // Use LLM to extract requirements
            const result = await geminiClient.generateJSON<JobRequirements>(
                PROMPTS.parseJD.user(jdText),
                PROMPTS.parseJD.system,
                0.2 // Low temperature for consistent results
            );

            // Validate response
            if (!result.must_have || !result.nice_to_have) {
                throw new Error('Invalid response format from LLM');
            }

            // Normalize keywords (lowercase, trim)
            const must_have = result.must_have.map(k => k.toLowerCase().trim()).filter(k => k.length > 0);
            const nice_to_have = result.nice_to_have.map(k => k.toLowerCase().trim()).filter(k => k.length > 0);

            return {
                requirements: {
                    must_have,
                    nice_to_have
                },
                metadata: {
                    totalKeywords: must_have.length + nice_to_have.length,
                    parsedAt: new Date()
                }
            };
        } catch (error) {
            throw new Error(`Failed to parse job description: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Extract keywords manually as fallback
     * Used if LLM parsing fails
     */
    private fallbackExtraction(jdText: string): JobRequirements {
        // Simple keyword extraction based on common tech terms
        const techKeywords = [
            'javascript', 'typescript', 'python', 'java', 'react', 'node.js',
            'angular', 'vue', 'sql', 'mongodb', 'aws', 'docker', 'kubernetes',
            'git', 'agile', 'rest api', 'graphql', 'ci/cd'
        ];

        const lowerText = jdText.toLowerCase();
        const found: string[] = [];

        techKeywords.forEach(keyword => {
            if (lowerText.includes(keyword)) {
                found.push(keyword);
            }
        });

        // Assume first half are must_have, rest are nice_to_have
        const midpoint = Math.ceil(found.length / 2);

        return {
            must_have: found.slice(0, midpoint),
            nice_to_have: found.slice(midpoint)
        };
    }
}

export const jdParserService = new JDParserService();
