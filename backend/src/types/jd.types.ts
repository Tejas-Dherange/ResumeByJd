/**
 * Job Description-related TypeScript interfaces
 */

/**
 * Represents a skill with its description
 * Key: Skill name (e.g., "React", "Node.js")
 * Value: Short description of the skill and how it's used in the role
 */
export type SkillRequirements = Record<string, string>;

/**
 * Job requirements structured as must_have and nice_to_have skills
 * Each skill maps to a description explaining its role
 */
export interface JobRequirements {
    must_have: SkillRequirements;    // Required/essential skills mapped to descriptions
    nice_to_have: SkillRequirements; // Preferred/optional skills mapped to descriptions
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
