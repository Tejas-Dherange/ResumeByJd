import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import fs from 'fs';
import path from 'path';
import { OptimizedResumeContent } from '../types/resume.types';

/**
 * Resume Renderer Service
 * Converts optimized JSON back to DOCX format while preserving formatting
 */
class ResumeRendererService {

    /**
     * Render optimized resume content back to DOCX
     * 
     * This is challenging because we need to:
     * 1. Load the original DOCX as a template
     * 2. Replace only the content, not the formatting
     * 3. Generate a new DOCX file
     * 
     * For now, we'll use docxtemplater for basic rendering
     */
    async renderToDocx(
        originalFilePath: string,
        optimizedContent: OptimizedResumeContent,
        outputPath: string
    ): Promise<string> {
        try {
            // Read the original DOCX file
            const content = fs.readFileSync(originalFilePath, 'binary');

            // Load into PizZip
            const zip = new PizZip(content);

            // Create docxtemplater instance
            const doc = new Docxtemplater(zip, {
                paragraphLoop: true,
                linebreaks: true,
            });

            // Convert sections to template data
            const templateData = this.convertToTemplateData(optimizedContent);

            // Set the template data
            doc.render(templateData);

            // Generate the output DOCX
            const buf = doc.getZip().generate({
                type: 'nodebuffer',
                compression: 'DEFLATE',
            });

            // Ensure output directory exists
            const outputDir = path.dirname(outputPath);
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            // Write to file
            fs.writeFileSync(outputPath, buf);

            return outputPath;
        } catch (error) {
            throw new Error(`Failed to render DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Convert optimized content to template data format
     * 
     * This is a simplified approach - in production, you'd need more
     * sophisticated template mapping based on your resume format
     */
    private convertToTemplateData(content: OptimizedResumeContent): any {
        const data: any = {};

        content.sections.forEach((section: any) => {
            // Create a key from the section title
            const key = section.title.toLowerCase().replace(/\s+/g, '_');

            // Store content as array
            data[key] = section.content.map((item: string) => ({ text: item }));
        });

        return data;
    }

    /**
     * Simple approach: Create new DOCX from scratch with optimized content
     * This preserves less formatting but is more reliable
     */
    async renderSimpleDocx(
        optimizedContent: OptimizedResumeContent,
        outputPath: string
    ): Promise<string> {
        try {
            // For a simple implementation, we'll create a basic DOCX structure
            // In production, you'd use a library like docx or officegen

            // Create a simple text representation first
            const textContent = this.convertToText(optimizedContent);

            // For now, save as .txt (you can upgrade to full DOCX generation later)
            fs.writeFileSync(outputPath.replace('.docx', '.txt'), textContent);

            return outputPath.replace('.docx', '.txt');
        } catch (error) {
            throw new Error(`Failed to render simple DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Convert optimized content to plain text
     */
    private convertToText(content: OptimizedResumeContent): string {
        let text = '';

        content.sections.forEach((section: any) => {
            text += `${section.title.toUpperCase()}\n`;
            text += '='.repeat(section.title.length) + '\n\n';

            section.content.forEach((item: string) => {
                text += `• ${item}\n`;
            });

            text += '\n';
        });

        text += '\n---\n';
        text += `Optimized on: ${content.metadata.optimizedAt}\n`;
        text += `Model: ${content.metadata.model}\n`;

        return text;
    }
}

export const resumeRendererService = new ResumeRendererService();
