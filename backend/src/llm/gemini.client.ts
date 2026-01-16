import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();
/**
 * Gemini client using OpenAI-compatible API
 * 
 * This uses the OpenAI SDK but points to Gemini's compatible endpoint
 */
class GeminiClient {
    private client: OpenAI;
    private model: string = 'gemini-2.5-flash';

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            throw new Error('GEMINI_API_KEY environment variable is required');
        }

        // Initialize OpenAI client with Gemini endpoint
        this.client = new OpenAI({
            apiKey: apiKey,
            baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/'
        });
    }

    /**
     * Generate completion with JSON response
     */
    async generateJSON<T>(
        prompt: string,
        systemPrompt?: string,
        temperature: number = 0.2
    ): Promise<T> {
        try {
            const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

            if (systemPrompt) {
                messages.push({
                    role: 'system',
                    content: systemPrompt
                });
            }

            messages.push({
                role: 'user',
                content: prompt
            });

            console.log('🤖 Gemini Request:', {
                model: this.model,
                temperature,
                promptLength: prompt.length,
                systemPromptLength: systemPrompt?.length || 0
            });

            const completion = await this.client.chat.completions.create({
                model: this.model,
                messages,
                temperature,
                response_format: { type: 'json_object' }
            });

            const content = completion.choices[0]?.message?.content;

            if (!content) {
                throw new Error('No response from Gemini');
            }

            console.log('✅ Gemini Response:', {
                length: content.length,
                preview: content.substring(0, 200)
            });

            return JSON.parse(content) as T;
        } catch (error) {
            console.error('❌ Gemini API error:', error);
            throw new Error(`Failed to generate response: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Generate text completion
     */
    async generateText(
        prompt: string,
        systemPrompt?: string,
        temperature: number = 0.3
    ): Promise<string> {
        try {
            const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

            if (systemPrompt) {
                messages.push({
                    role: 'system',
                    content: systemPrompt
                });
            }

            messages.push({
                role: 'user',
                content: prompt
            });

            const completion = await this.client.chat.completions.create({
                model: this.model,
                messages,
                temperature
            });

            return completion.choices[0]?.message?.content || '';
        } catch (error) {
            console.error('Gemini API error:', error);
            throw new Error(`Failed to generate response: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}

// Export singleton instance
export const geminiClient = new GeminiClient();
