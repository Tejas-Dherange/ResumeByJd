/**
 * Utility functions for text tokenization and keyword extraction
 */

// Common stop words to ignore
const STOP_WORDS = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
    'to', 'was', 'will', 'with', 'i', 'we', 'you', 'this', 'have', 'had'
]);

/**
 * Tokenize text into words, removing stop words and normalizing
 */
export function tokenize(text: string): string[] {
    // Convert to lowercase and split by non-alphanumeric characters
    const words = text
        .toLowerCase()
        .split(/[^a-z0-9#+.]+/)
        .filter(word => word.length > 1 && !STOP_WORDS.has(word));

    return words;
}

/**
 * Extract n-grams (multi-word phrases) from text
 * Example: "machine learning" instead of just "machine" and "learning"
 */
export function extractNGrams(text: string, n: number = 2): string[] {
    const words = text.toLowerCase().split(/\s+/);
    const ngrams: string[] = [];

    for (let i = 0; i <= words.length - n; i++) {
        const ngram = words.slice(i, i + n).join(' ');
        // Only include if it doesn't consist entirely of stop words
        if (!words.slice(i, i + n).every(w => STOP_WORDS.has(w))) {
            ngrams.push(ngram);
        }
    }

    return ngrams;
}

/**
 * Calculate keyword frequency in text
 */
export function calculateKeywordFrequency(text: string, keyword: string): number {
    const lowerText = text.toLowerCase();
    const lowerKeyword = keyword.toLowerCase();

    let count = 0;
    let position = 0;

    while ((position = lowerText.indexOf(lowerKeyword, position)) !== -1) {
        count++;
        position += lowerKeyword.length;
    }

    return count;
}

/**
 * Normalize text for comparison
 */
export function normalizeText(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Extract technical skills/keywords from text
 * Looks for common patterns in tech resumes
 */
export function extractTechnicalKeywords(text: string): string[] {
    const keywords: Set<string> = new Set();

    // Common tech patterns to look for
    const patterns = [
        // Programming languages
        /\b(javascript|typescript|python|java|c\+\+|c#|ruby|go|rust|php|swift|kotlin)\b/gi,
        // Frameworks and libraries
        /\b(react|angular|vue|node\.?js|express|django|flask|spring|\.net|rails)\b/gi,
        // Databases
        /\b(postgresql|mysql|mongodb|redis|elasticsearch|dynamodb|sql|nosql)\b/gi,
        // Cloud and DevOps
        /\b(aws|azure|gcp|docker|kubernetes|ci\/cd|jenkins|github\s*actions)\b/gi,
        // Tools
        /\b(git|jira|figma|postman|webpack|vite|prisma)\b/gi
    ];

    patterns.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) {
            matches.forEach(match => keywords.add(match.toLowerCase()));
        }
    });

    return Array.from(keywords);
}
