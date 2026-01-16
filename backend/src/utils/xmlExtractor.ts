import AdmZip from 'adm-zip';
import { XMLParser } from 'fast-xml-parser';

/**
 * Extract XML content from DOCX file
 * DOCX files are ZIP archives containing XML files
 */
export async function extractDocxXML(filePath: string): Promise<string> {
    try {
        // DOCX is a ZIP file
        const zip = new AdmZip(filePath);

        // The main document content is in word/document.xml
        const documentXML = zip.readAsText('word/document.xml');

        if (!documentXML) {
            throw new Error('Could not find document.xml in DOCX file');
        }

        return documentXML;
    } catch (error) {
        throw new Error(`Failed to extract XML from DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Parse XML string into JavaScript object
 */
export function parseXML(xmlString: string): any {
    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
        textNodeName: '#text',
        parseAttributeValue: false,  // Don't parse attributes
        trimValues: false,            // CRITICAL: Don't trim text!
        ignoreDeclaration: true
    });

    console.log('🔧 Parsing XML...');
    const result = parser.parse(xmlString);
    console.log('✅ Parsed, checking first paragraph structure...');

    // Debug: check first paragraph
    const body = result?.['w:document']?.['w:body'];
    if (body && body['w:p']) {
        const firstPara = Array.isArray(body['w:p']) ? body['w:p'][0] : body['w:p'];
        console.log('📋 First paragraph keys:', Object.keys(firstPara || {}));
        if (firstPara && firstPara['w:r']) {
            console.log('✅ w:r (runs) found in first paragraph');
        } else {
            console.log('❌ No w:r in first paragraph');
        }
    }

    return result;
}

/**
 * Extract text content from parsed DOCX XML
 * Navigates the complex structure of Word XML to extract text
 */
export function extractTextFromDocxXML(parsedXML: any): string {
    let text = '';

    try {
        // Word document structure: w:document -> w:body -> w:p (paragraphs) -> w:r (runs) -> w:t (text)
        const body = parsedXML?.['w:document']?.['w:body'];

        if (!body) {
            return text;
        }

        // Get all paragraphs
        const paragraphs = body['w:p'];

        if (!paragraphs) {
            return text;
        }

        // Handle single paragraph or array of paragraphs
        const pArray = Array.isArray(paragraphs) ? paragraphs : [paragraphs];

        pArray.forEach((paragraph: any) => {
            let paragraphText = '';

            // Get runs (text segments) in paragraph
            const runs = paragraph['w:r'];

            if (runs) {
                const runArray = Array.isArray(runs) ? runs : [runs];

                runArray.forEach((run: any) => {
                    const textNode = run['w:t'];

                    if (textNode) {
                        if (typeof textNode === 'string') {
                            paragraphText += textNode;
                        } else if (textNode['#text']) {
                            paragraphText += textNode['#text'];
                        }
                    }
                });
            }

            if (paragraphText.trim()) {
                text += paragraphText + '\n';
            }
        });

    } catch (error) {
        console.error('Error extracting text from XML:', error);
    }

    return text.trim();
}
