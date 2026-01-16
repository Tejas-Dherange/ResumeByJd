/**
 * Job Description-related TypeScript interfaces
 */

export interface JobRequirements {
    must_have: string[];    // Required skills/technologies
    nice_to_have: string[]; // Preferred skills/technologies
}

export interface ParsedJD {
    requirements: JobRequirements;
    metadata: {
        totalKeywords: number;
        parsedAt: Date;
    };
}

export interface GapAnalysis {
    present: string[];      // Keywords with strong presence
    weak: string[];         // Keywords with weak presence
    missing: string[];      // Keywords not found
    coverage: {
        mustHavePercent: number;
        niceToHavePercent: number;
        overall: number;
    };
}

export interface ATSScore {
    before: number;         // Score 0-100 before optimization
    after: number;          // Score 0-100 after optimization
    breakdown: {
        keywordMatch: number;
        sectionCoverage: number;
        actionVerbs: number;
        formatQuality: number;
    };
}
