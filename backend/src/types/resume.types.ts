/**
 * Resume-related TypeScript interfaces
 */

export interface ResumeSection {
    title: string;           // e.g., "Experience", "Education", "Skills"
    content: string[];       // Array of text content (paragraphs, bullets)
    bullets?: BulletPoint[]; // Structured bullet points if applicable
    metadata?: {
        position?: number;     // Original position in document
        formatting?: string;   // Font, size, style information
    };
}

export interface BulletPoint {
    text: string;
    level: number;           // Hierarchy level (0 = top-level, 1 = nested, etc.)
    position: number;        // Order in section
}

export interface ParsedResume {
    sections: ResumeSection[];
    metadata: {
        totalSections: number;
        wordCount: number;
        extractedAt: Date;
    };
}

export interface ResumeUpload {
    file: Express.Multer.File;
    userId?: string;
}

export interface OptimizedResumeContent {
    sections: ResumeSection[];
    changedSections: string[];  // List of section titles that were modified
    metadata: {
        optimizedAt: Date;
        model: string;
    };
}
