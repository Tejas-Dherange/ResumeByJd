import { GapAnalysis, JobRequirements } from '../types/jd.types';
import { ParsedResume } from '../types/resume.types';
import { calculateKeywordFrequency, normalizeText } from '../utils/tokenizer';

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
            const normalizedResumeText = normalizeText(resumeText);

            // Analyze all keywords
            const allKeywords = [...requirements.must_have, ...requirements.nice_to_have];

            const present: string[] = [];
            const weak: string[] = [];
            const missing: string[] = [];

            for (const keyword of allKeywords) {
                const classification = this.classifyKeyword(normalizedResumeText, keyword);

                switch (classification) {
                    case 'present':
                        present.push(keyword);
                        break;
                    case 'weak':
                        weak.push(keyword);
                        break;
                    case 'missing':
                        missing.push(keyword);
                        break;
                }
            }

            // Calculate coverage
            const mustHavePresent = requirements.must_have.filter(k =>
                present.includes(k) || weak.includes(k)
            ).length;
            const niceToHavePresent = requirements.nice_to_have.filter(k =>
                present.includes(k) || weak.includes(k)
            ).length;

            const mustHavePercent = requirements.must_have.length > 0
                ? (mustHavePresent / requirements.must_have.length) * 100
                : 100;

            const niceToHavePercent = requirements.nice_to_have.length > 0
                ? (niceToHavePresent / requirements.nice_to_have.length) * 100
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

    /**
     * Classify keyword strength in resume
     */
    private classifyKeyword(resumeText: string, keyword: string): 'present' | 'weak' | 'missing' {
        const frequency = calculateKeywordFrequency(resumeText, keyword);

        if (frequency === 0) {
            return 'missing';
        } else if (frequency >= 3) {
            return 'present';
        } else {
            return 'weak';
        }
    }

    /**
     * Check if keyword appears in prominent sections
     * (Experience, Skills sections carry more weight)
     */
    private isInProminentSection(resume: ParsedResume, keyword: string): boolean {
        const prominentSections = ['experience', 'skills', 'technical skills', 'work experience', 'projects'];

        for (const section of resume.sections) {
            const lowerTitle = section.title.toLowerCase();

            if (prominentSections.some(ps => lowerTitle.includes(ps))) {
                const sectionText = section.content.join(' ').toLowerCase();
                if (sectionText.includes(keyword.toLowerCase())) {
                    return true;
                }
            }
        }

        return false;
    }
}

export const gapAnalysisService = new GapAnalysisService();
