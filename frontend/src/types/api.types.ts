/**
 * Frontend API types matching backend responses
 */

export interface GapAnalysis {
    present: string[];
    weak: string[];
    missing: string[];
    coverage: {
        mustHavePercent: number;
        niceToHavePercent: number;
        overall: number;
    };
}

export interface ATSScore {
    before: number;
    after: number;
    breakdown: {
        keywordMatch: number;
        sectionCoverage: number;
        actionVerbs: number;
        formatQuality: number;
    };
}

export interface ResumeSection {
    title: string;
    content: string[];
    bullets?: Array<{
        text: string;
        level: number;
        position: number;
    }>;
}

export interface UploadResponse {
    success: boolean;
    data: {
        resumeId: string;
        jobDescriptionId: string;
        message: string;
    };
}

export interface AnalysisResponse {
    success: boolean;
    data: {
        analysisId: string;
        gapAnalysis: GapAnalysis;
        atsScoreBefore: number;
        parsedResume: {
            sections: ResumeSection[];
            metadata: {
                totalSections: number;
                wordCount: number;
            };
        };
    };
}

export interface OptimizationResponse {
    success: boolean;
    data: {
        optimizedResumeId: string;
        validation: {
            isValid: boolean;
            addedSkills: string[];
            message: string;
        };
        atsScoreBefore: number;
        atsScoreAfter: number;
        atsBreakdown: {
            keywordMatch: number;
            sectionCoverage: number;
            actionVerbs: number;
            formatQuality: number;
        };
        changedSections: string[];
        downloadPath: string;
    };
}
