import { ATSScore, JobRequirements } from '../types/jd.types';
import { ParsedResume } from '../types/resume.types';
import { calculateKeywordFrequency, normalizeText } from '../utils/tokenizer';

/**
 * ATS Scorer Service
 * Calculates ATS compatibility score based on multiple factors
 */
class ATSScorerService {

    // Strong action verbs that ATS systems look for
    private readonly actionVerbs = new Set([
        'achieved', 'administered', 'analyzed', 'architected', 'automated',
        'built', 'collaborated', 'created', 'delivered', 'designed',
        'developed', 'engineered', 'established', 'executed', 'implemented',
        'improved', 'increased', 'launched', 'led', 'managed', 'optimized',
        'organized', 'pioneered', 'reduced', 'resolved', 'streamlined',
        'transformed', 'upgraded'
    ]);

    /**
     * Calculate ATS score for a resume against job requirements
     * 
     * Scoring breakdown:
     * - Keyword match: 40%
     * - Section coverage: 30%
     * - Action verbs: 20%
     * - Format quality: 10%
     * 
     * Returns score 0-100
     */
    calculateScore(resume: ParsedResume, requirements: JobRequirements): ATSScore {
        const keywordMatch = this.calculateKeywordMatchScore(resume, requirements);
        const sectionCoverage = this.calculateSectionCoverageScore(resume);
        const actionVerbs = this.calculateActionVerbScore(resume);
        const formatQuality = this.calculateFormatQualityScore(resume);

        // Weighted total
        const total = (
            keywordMatch * 0.40 +
            sectionCoverage * 0.30 +
            actionVerbs * 0.20 +
            formatQuality * 0.10
        );

        return {
            before: 0, // Will be set by controller
            after: Math.round(total),
            breakdown: {
                keywordMatch: Math.round(keywordMatch),
                sectionCoverage: Math.round(sectionCoverage),
                actionVerbs: Math.round(actionVerbs),
                formatQuality: Math.round(formatQuality)
            }
        };
    }

    /**
     * Calculate keyword match percentage
     * 
     * Checks how many required keywords appear in resume
     */
    private calculateKeywordMatchScore(
        resume: ParsedResume,
        requirements: JobRequirements
    ): number {
        const resumeText = this.extractFullText(resume);
        const normalizedText = normalizeText(resumeText);

        const allKeywords = [
            ...Object.keys(requirements.must_have).map(k => k.toLowerCase().trim()),
            ...Object.keys(requirements.nice_to_have).map(k => k.toLowerCase().trim())
        ];
        let matchedCount = 0;

        for (const keyword of allKeywords) {
            const frequency = calculateKeywordFrequency(normalizedText, keyword);
            if (frequency > 0) {
                matchedCount++;
            }
        }

        return allKeywords.length > 0
            ? (matchedCount / allKeywords.length) * 100
            : 0;
    }

    /**
     * Calculate section coverage score
     * 
     * ATS looks for standard sections:
     * - Experience / Work Experience
     * - Education
     * - Skills / Technical Skills
     * - Contact information
     */
    private calculateSectionCoverageScore(resume: ParsedResume): number {
        const requiredSections = [
            'experience',
            'education',
            'skills'
        ];

        const sectionTitles = resume.sections
            .map(s => s.title.toLowerCase())
            .join(' ');

        let foundCount = 0;

        for (const required of requiredSections) {
            if (sectionTitles.includes(required)) {
                foundCount++;
            }
        }

        return (foundCount / requiredSections.length) * 100;
    }

    /**
     * Calculate action verb usage score
     * 
     * Strong action verbs make resume more impactful
     */
    private calculateActionVerbScore(resume: ParsedResume): number {
        const resumeText = this.extractFullText(resume);
        const words = resumeText.toLowerCase().split(/\s+/);

        let actionVerbCount = 0;
        let totalBullets = 0;

        // Count bullets across all sections
        resume.sections.forEach(section => {
            totalBullets += section.content.length;
        });

        // Count how many action verbs are used
        words.forEach(word => {
            if (this.actionVerbs.has(word)) {
                actionVerbCount++;
            }
        });

        // Good resume should have at least 1 action verb per 2 bullets
        const expectedVerbs = totalBullets / 2;
        const score = Math.min((actionVerbCount / expectedVerbs) * 100, 100);

        return score;
    }

    /**
     * Calculate format quality score
     * 
     * Checks for:
     * - Presence of bullet points
     * - Quantifiable metrics (numbers)
     * - Appropriate length
     */
    private calculateFormatQualityScore(resume: ParsedResume): number {
        let score = 0;

        // Check for bullet points
        const hasBullets = resume.sections.some(s =>
            s.bullets && s.bullets.length > 0
        );
        if (hasBullets) score += 40;

        // Check for quantifiable metrics (numbers)
        const resumeText = this.extractFullText(resume);
        const hasMetrics = /\d+%|\d+\+|\d+x|\$\d+/.test(resumeText);
        if (hasMetrics) score += 30;

        // Check word count (800-1500 is ideal)
        const wordCount = resume.metadata.wordCount;
        if (wordCount >= 800 && wordCount <= 1500) {
            score += 30;
        } else if (wordCount >= 500 && wordCount <= 2000) {
            score += 15;
        }

        return score;
    }

    /**
     * Extract full text from resume
     */
    private extractFullText(resume: ParsedResume): string {
        return resume.sections
            .map(section => `${section.title} ${section.content.join(' ')}`)
            .join(' ');
    }
}

export const atsScorerService = new ATSScorerService();
