import { ParsedResume, ResumeSection } from '../types/resume.types';
import { extractDocxXML, parseXML, extractTextFromDocxXML } from '../utils/xmlExtractor';

/**
 * Resume Parser Service
 * Converts DOCX files to structured JSON while preserving formatting and hierarchy
 */
class ResumeParserService {

    /**
     * Parse a DOCX resume file into structured format
     * 
     * Process:
     * 1. Accept .docx file
     * 2. Extract XML from DOCX (it's a ZIP archive)
     * 3. Parse XML using fast-xml-parser
     * 4. Preserve section order, bullet hierarchy, and text positions
     * 5. Return structured JSON
     */
    async parseResume(filePath: string): Promise<ParsedResume> {
        try {
            console.log('📄 Parsing resume from:', filePath);

            // Extract XML from DOCX
            const xmlContent = await extractDocxXML(filePath);

            // Parse XML
            const parsedXML = parseXML(xmlContent);

            // Extract structured sections
            const sections = this.extractSections(parsedXML);

            console.log('✅ Resume parsed:', {
                totalSections: sections.length,
                sectionTitles: sections.map(s => s.title)
            });

            // Extract full text for metadata
            const fullText = extractTextFromDocxXML(parsedXML);
            const wordCount = fullText.split(/\s+/).length;

            return {
                sections,
                metadata: {
                    totalSections: sections.length,
                    wordCount,
                    extractedAt: new Date()
                }
            };
        } catch (error) {
            console.error('❌ Resume parsing error:', error);
            throw new Error(`Failed to parse resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Extract sections from parsed DOCX XML
     * Identifies sections like "Experience", "Education", "Skills" based on formatting
     */
    private extractSections(parsedXML: any): ResumeSection[] {
        const sections: ResumeSection[] = [];
        let currentSection: ResumeSection | null = null;
        let sectionPosition = 0;

        try {
            console.log('🔍 Extracting sections from XML...');
            console.log('📋 parsedXML keys:', Object.keys(parsedXML || {}));

            const body = parsedXML?.['w:document']?.['w:body'];

            if (!body) {
                console.log('❌ No w:document or w:body found');
                return sections;
            }

            console.log('✅ Body found, keys:', Object.keys(body));

            const paragraphs = body['w:p'];
            if (!paragraphs) {
                console.log('❌ No w:p (paragraphs) found in body');
                return sections;
            }

            const pArray = Array.isArray(paragraphs) ? paragraphs : [paragraphs];
            console.log(`📝 Found ${pArray.length} paragraphs`);

            pArray.forEach((paragraph: any, index: number) => {
                const text = this.extractParagraphText(paragraph);

                if (!text.trim()) return;

                // Log first few paragraphs for debugging
                if (index < 5) {
                    console.log(`Paragraph ${index}: "${text.substring(0, 60)}..."`);
                }

                // Check if this is a section header (usually bold, larger font, or all caps)
                const isHeader = this.isLikelySectionHeader(paragraph, text);

                if (isHeader) {
                    console.log(`✅ Detected section header: "${text}"`);

                    // Save previous section if exists
                    if (currentSection) {
                        sections.push(currentSection);
                    }

                    // Start new section
                    currentSection = {
                        title: text.trim(),
                        content: [],
                        bullets: [],
                        metadata: {
                            position: sectionPosition++
                        }
                    };
                } else if (currentSection) {
                    // Add content to current section
                    currentSection.content.push(text.trim());

                    // Check if it's a bullet point
                    if (this.isBulletPoint(paragraph, text)) {
                        const level = this.getBulletLevel(paragraph);
                        currentSection.bullets!.push({
                            text: text.trim(),
                            level,
                            position: currentSection.bullets!.length
                        });
                    }
                }
            });

            // Don't forget the last section
            if (currentSection) {
                sections.push(currentSection);
            }

            console.log(`✅ Total sections extracted: ${sections.length}`);

        } catch (error) {
            console.error('❌ Error extracting sections:', error);
        }

        return sections;
    }

    /**
     * Extract text from a paragraph
     */
    private extractParagraphText(paragraph: any): string {
        let text = '';

        const runs = paragraph['w:r'];
        if (!runs) {
            if (Object.keys(paragraph).length > 0 && Math.random() < 0.05) {
                console.log('⚠️ Paragraph has no w:r (runs), keys:', Object.keys(paragraph));
            }
            return text;
        }

        const runArray = Array.isArray(runs) ? runs : [runs];

        // Debug first run to see structure
        if (runArray.length > 0 && Math.random() < 0.02) {
            const firstRun = runArray[0];
            console.log('🔍 Debug run structure:', {
                keys: Object.keys(firstRun),
                hasWT: !!firstRun['w:t'],
                wtType: typeof firstRun['w:t'],
                wtValue: firstRun['w:t']
            });
        }

        runArray.forEach((run: any) => {
            const textNode = run['w:t'];

            if (textNode) {
                if (typeof textNode === 'string') {
                    text += textNode;
                } else if (typeof textNode === 'object') {
                    // Try different possible text locations
                    if (textNode['#text']) {
                        text += textNode['#text'];
                    } else if (textNode['_']) {
                        text += textNode['_'];
                    } else {
                        // Log structure for debugging
                        if (Math.random() < 0.02) {
                            console.log('⚠️ Unknown w:t structure:', JSON.stringify(textNode));
                        }
                    }
                }
            }
        });

        return text;
    }

    /**
     * Detect if a paragraph is likely a section header
     * Headers are typically:
     * - Short (< 50 characters)
     * - Bold or larger font
     * - All caps or title case
     */
    private isLikelySectionHeader(paragraph: any, text: string): boolean {
        // Check text characteristics
        if (text.length > 50) return false;
        if (text.length < 3) return false;

        // Common section names
        const commonSections = [
            'experience', 'education', 'skills', 'projects',
            'summary', 'objective', 'certifications', 'awards',
            'work experience', 'technical skills', 'professional experience'
        ];

        const lowerText = text.toLowerCase().trim();
        if (commonSections.some(section => lowerText === section || lowerText.includes(section))) {
            return true;
        }

        // Check if all caps (likely a header)
        if (text === text.toUpperCase() && text.length > 3) {
            return true;
        }

        return false;
    }

    /**
     * Detect if a paragraph is a bullet point
     */
    private isBulletPoint(paragraph: any, text: string): boolean {
        // Check for bullet symbols
        const bulletSymbols = ['•', '·', '○', '■', '▪', '−', '-'];
        const firstChar = text.trim()[0];

        if (bulletSymbols.includes(firstChar)) {
            return true;
        }

        // Check for numbered lists
        if (/^\d+\./.test(text.trim())) {
            return true;
        }

        return false;
    }

    /**
     * Get bullet indentation level
     */
    private getBulletLevel(paragraph: any): number {
        // Check indentation in paragraph properties
        try {
            const pPr = paragraph['w:pPr'];
            if (pPr && pPr['w:ind']) {
                const indent = pPr['w:ind']['@_w:left'];
                if (indent) {
                    // Convert indentation to level (approximate)
                    return Math.floor(parseInt(indent) / 720); // 720 twips = 0.5 inch
                }
            }
        } catch (error) {
            // If we can't determine, default to 0
        }

        return 0;
    }
}

export const resumeParserService = new ResumeParserService();
