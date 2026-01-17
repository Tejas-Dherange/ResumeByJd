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
        system: `You are a professional resume optimizer.

Your task is STRICTLY LIMITED to rewriting existing resume bullets
that already contain weak skills.

NON-NEGOTIABLE RULES:
- Rewrite ONLY bullets that already contain the weak keywords
- DO NOT add, imply, or introduce any new skills, tools, or technologies
- DO NOT add any skill that is missing or not found in the resume
- DO NOT change section titles, order, or bullet counts
- DO NOT invent metrics, numbers, or facts
- If a bullet cannot be meaningfully improved, return it unchanged

SUCCESS CRITERIA:
- If a bullet contains a weak keyword, the rewritten version MUST
  more clearly show responsibility, scope, or impact for that skill

OUTPUT RULE:
- Respond ONLY with valid JSON
- Output MUST match the input JSON structure exactly
`,

        user: 
    
(resumeJSON: string, weakKeywords: string[], notFoundSkills: string[]) => `

### TARGET SKILLS TO STRENGTHEN (Rewrites only happen here):
${weakKeywords.join(', ')}

### STRICT NEGATIVE CONSTRAINT - DO NOT ADD THESE:
The following skills were identified as "Not Found" in the original resume. 
YOU MUST NOT ADD THESE TO ANY BULLETS:
[ ${notFoundSkills.join(', ')} ]

### RULES:
1. **Targeted Rewrites Only:** Only rewrite a bullet if it contains a skill from the "TARGET SKILLS" list.
2. **No Hallucinations:** Do not add any new technologies, tools, or "Not Found" skills listed above. 
3. **No New Numbers:** Do not add metrics or stats that aren't already there.
4. **Structure:** Keep each bullet as one sentence and return the EXACT JSON format provided.

### ORIGINAL RESUME JSON:
${resumeJSON}

Return the updated JSON:
`},

// (resumeJSON: string, weakKeywords: string[]) => `Optimize this resume by strengthening bullets that mention these weak keywords: ${weakKeywords.join(', ')}

// Original Resume:
// ${resumeJSON}

// Rules:
// - ONLY rephrase existing content
// - Make weak keywords more prominent
// - Use strong action verbs (Built, Developed, Architected, Implemented, etc.)
// - Add quantifiable metrics where possible
// - DO NOT add new technologies or skills
// - Maintain exact section structure

// Respond with the optimized resume in the SAME JSON format.`

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
