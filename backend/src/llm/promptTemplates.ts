/**
 * Prompt templates for LLM operations
 */

export const PROMPTS = {
    /**
     * Parse job description to extract requirements
     */
    parseJD: {
        system: `You are an expert HR analyst. Extract technical skills, tools, and requirements from job descriptions.
Always respond with valid JSON only.`,

        user: (jdText: string) => `Analyze this job description and extract:
1. must_have: Skills/technologies that are required (mentioned as "required", "must have", or emphasized)
2. nice_to_have: Skills/technologies that are preferred but optional

Job Description:
${jdText}

Respond with JSON in this exact format:
{
  "must_have": ["skill1", "skill2"],
  "nice_to_have": ["skill3", "skill4"]
}`
    },

    /**
     * Rewrite resume content to strengthen weak areas
     */
    rewriteResume: {
        system: `You are a professional resume writer. Your task is to enhance resume content by:
1. Strengthening existing bullets that mention weak keywords
2. Using stronger action verbs and quantifiable metrics
3. NEVER adding new skills, tools, or technologies not already present
4. Maintaining the exact structure and section order

CRITICAL: Do NOT invent or add any skills/technologies. Only rephrase existing content.
Always respond with valid JSON only.`,

        user: (resumeJSON: string, weakKeywords: string[]) => `Optimize this resume by strengthening bullets that mention these weak keywords: ${weakKeywords.join(', ')}

Original Resume:
${resumeJSON}

Rules:
- ONLY rephrase existing content
- Make weak keywords more prominent
- Use strong action verbs (Built, Developed, Architected, Implemented, etc.)
- Add quantifiable metrics where possible
- DO NOT add new technologies or skills
- Maintain exact section structure

Respond with the optimized resume in the SAME JSON format.`
    },

    /**
     * Validate for hallucinations
     */
    validateHallucination: {
        system: `You are a strict validator. Compare two resumes and detect if new skills/tools were added.
Always respond with valid JSON only.`,

        user: (originalResume: string, optimizedResume: string) => `Compare these two resumes and check if the optimized version added any NEW skills, tools, or technologies not present in the original.

Original Resume:
${originalResume}

Optimized Resume:
${optimizedResume}

Respond with JSON:
{
  "isValid": true/false,
  "addedSkills": ["skill1", "skill2"],
  "message": "explanation"
}`
    },

    /**
     * Enhanced gap analysis classification
     */
    classifyKeywordStrength: {
        system: `You are an ATS keyword analyzer. Classify how strongly a keyword appears in resume content.
Always respond with valid JSON only.`,

        user: (resumeText: string, keyword: string) => `Analyze how the keyword "${keyword}" appears in this resume.

Resume Content:
${resumeText}

Classify as:
- "present": Mentioned multiple times, in prominent positions (experience bullets, skills section)
- "weak": Mentioned once or briefly
- "missing": Not mentioned at all

Respond with JSON:
{
  "keyword": "${keyword}",
  "classification": "present|weak|missing",
  "occurrences": number,
  "context": "brief explanation"
}`
    }
};
