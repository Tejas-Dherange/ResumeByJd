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
     * Uses Gemini to classify skills into must_have and nice_to_have with descriptions
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
            if (!result || !result.must_have || !result.nice_to_have) {
                throw new Error('Invalid response format from LLM');
            }

            // Calculate total keywords
            const totalKeywords = Object.keys(result.must_have).length + Object.keys(result.nice_to_have).length;

            return {
                requirements: result,
                metadata: {
                    totalKeywords,
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
        const must_have: Record<string, string> = {};
        const nice_to_have: Record<string, string> = {};

        techKeywords.forEach((keyword, index) => {
            if (lowerText.includes(keyword)) {
                const description = `${keyword} skill mentioned in job description`;
                // Split evenly between must_have and nice_to_have
                if (index % 2 === 0) {
                    must_have[keyword] = description;
                } else {
                    nice_to_have[keyword] = description;
                }
            }
        });

        return { must_have, nice_to_have };
    }
}

export const jdParserService = new JDParserService();
