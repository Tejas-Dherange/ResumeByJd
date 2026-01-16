import { ParsedResume, ResumeSection } from '../types/resume.types';

/**
 * Compare two resumes and generate a diff report
 * Useful for showing users what changed
 */
export interface DiffResult {
    sectionTitle: string;
    original: string[];
    optimized: string[];
    changes: Change[];
}

export interface Change {
    type: 'added' | 'removed' | 'modified';
    originalLine?: string;
    optimizedLine?: string;
    lineNumber: number;
}

/**
 * Generate diff between original and optimized resume
 */
export function generateResumeDiff(
    original: ParsedResume,
    optimized: ParsedResume
): DiffResult[] {
    const diffs: DiffResult[] = [];

    // Compare each section
    for (let i = 0; i < original.sections.length; i++) {
        const origSection = original.sections[i];
        const optSection = optimized.sections[i];

        if (!optSection || origSection.title !== optSection.title) {
            continue; // Skip if sections don't match
        }

        const changes: Change[] = [];
        const maxLength = Math.max(origSection.content.length, optSection.content.length);

        for (let j = 0; j < maxLength; j++) {
            const origLine = origSection.content[j];
            const optLine = optSection.content[j];

            if (origLine !== optLine) {
                if (!origLine) {
                    changes.push({
                        type: 'added',
                        optimizedLine: optLine,
                        lineNumber: j
                    });
                } else if (!optLine) {
                    changes.push({
                        type: 'removed',
                        originalLine: origLine,
                        lineNumber: j
                    });
                } else {
                    changes.push({
                        type: 'modified',
                        originalLine: origLine,
                        optimizedLine: optLine,
                        lineNumber: j
                    });
                }
            }
        }

        if (changes.length > 0) {
            diffs.push({
                sectionTitle: origSection.title,
                original: origSection.content,
                optimized: optSection.content,
                changes
            });
        }
    }

    return diffs;
}

/**
 * Calculate similarity percentage between two text strings
 */
export function calculateSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);

    const set1 = new Set(words1);
    const set2 = new Set(words2);

    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return (intersection.size / union.size) * 100;
}
