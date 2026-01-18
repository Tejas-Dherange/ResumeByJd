/**
 * Prompt templates for LLM operations
 */

export const PROMPTS = {
        /**
         * Parse job description to extract requirements
         */
        parseJD: {
                system: `You are an expert HR analyst and technical recruiter.

Your task is to analyze a job description and extract all technical skills, tools, technologies, frameworks, and platforms explicitly mentioned.
Classify each extracted skill into:
- must_have: skills that are required, essential, or core to the role
- nice_to_have: skills that are preferred, optional, or mentioned as a plus

For each skill, provide a concise, factual description explaining:
- what the skill is
- how it is expected to be used in this role (based strictly on the job description)

Always respond with valid JSON only.`,

                user: (jdText: string) => `
STRICT RULES:
- Respond with VALID JSON ONLY
- Do NOT add any text outside the JSON
- Do NOT invent or infer skills not explicitly mentioned
- Classification must be based ONLY on wording in the JD (e.g., "required", "must", "preferred", "nice to have")
- Use normalized, industry-standard skill names (e.g., "Node.js", not "node", "VS Code", not "vscode")
- Each description must be ONE sentence, maximum 25 words
- Avoid duplicate or overlapping skills
- Every skill must appear in ONLY ONE category

Job Description:
${jdText}

Respond in EXACTLY this format:
{
  "must_have": {
    "Skill Name": "Short description derived from the job description",
    "Skill Name": "Short description derived from the job description"
  },
  "nice_to_have": {
    "Skill Name": "Short description derived from the job description",
    "Skill Name": "Short description derived from the job description"
  }
}

EXAMPLE OUTPUT (FORMAT ONLY — NOT CONTENT):
{
  "must_have": {
    "React": "Develop reusable frontend components and manage state for scalable web applications",
    "Node.js": "Build backend services and REST APIs to support application logic",
    "PostgreSQL": "Design, query, and maintain relational databases for application data storage"
  },
  "nice_to_have": {
    "Docker": "Containerize applications to ensure consistent development and deployment environments",
    "VS Code": "Use an integrated development environment for writing, debugging, and managing source code"
  }
}
`
        }
        ,

        /**
         * Rewrite resume content to strengthen weak areas
         */
rewriteResume: {
  system: `You are a professional resume optimizer.

Your task is STRICTLY LIMITED to rewriting existing resume bullets
that already contain weak skills.

You will be given:
- Resume content (structured JSON)
- A list of weak skills found in the resume
- A list of skills NOT found in the resume (forbidden)
- Job description skills with descriptions (for context only)

NON-NEGOTIABLE RULES:
- Rewrite ONLY bullets that already contain the weak skills
- DO NOT add, imply, or introduce any new skills, tools, or technologies
- DO NOT add any skill that is missing or listed as "Not Found"
- DO NOT change section titles, order, or bullet counts
- DO NOT invent metrics, numbers, or facts
- If a bullet cannot be meaningfully improved, return it unchanged

HOW TO USE THE JOB DESCRIPTION:
- Use JD skill descriptions ONLY to:
  - clarify responsibility
  - improve wording
  - align phrasing with role expectations
- NEVER introduce JD skills that are not already present in the bullet

SUCCESS CRITERIA:
- If a bullet contains a weak skill, the rewritten version MUST
  more clearly demonstrate responsibility, scope, or application
  of THAT SAME skill

OUTPUT RULES:
- Respond ONLY with valid JSON
- Output MUST match the input JSON structure EXACTLY
- Preserve all keys, nesting, and ordering`,

  user: (
    resumeJSON: string,
    weakKeywords: string[],
    notFoundSkills: string[],
    jdSkills: {
      must_have: Record<string, string>,
      nice_to_have: Record<string, string>
    }
  ) => `

### TARGET SKILLS TO STRENGTHEN (Rewrites ONLY happen for these):
${weakKeywords.join(', ')}

### STRICT NEGATIVE CONSTRAINT — DO NOT ADD THESE SKILLS:
The following skills were NOT found in the original resume.
YOU MUST NOT ADD THESE TO ANY BULLET:
[ ${notFoundSkills.join(', ')} ]

### JOB DESCRIPTION CONTEXT (REFERENCE ONLY — DO NOT ADD NEW SKILLS):
Must-have skills and how they are used in the role:
${JSON.stringify(jdSkills.must_have, null, 2)}

Nice-to-have skills and how they are used in the role:
${JSON.stringify(jdSkills.nice_to_have, null, 2)}

### REWRITE RULES:
1. Rewrite a bullet ONLY if it already contains a target (weak) skill
2. Use JD descriptions ONLY to improve clarity and relevance
3. Do NOT add missing or forbidden skills
4. Do NOT add metrics, timelines, or achievements not present
5. Keep each bullet as ONE sentence
6. Preserve the EXACT JSON structure

### ORIGINAL RESUME JSON:
${resumeJSON}

Return the updated resume JSON:
`
},

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
                system: `You are an ATS keyword analyzer with strong semantic understanding.

Your task is to evaluate how well a resume matches job-required skills.
Use semantic meaning, not just exact keyword matching.
Always respond with valid JSON only.`,

                user: (
                        resumeText: string,
                        jdSkills: {
                                must_have: Record<string, string>,
                                nice_to_have: Record<string, string>
                        }
                ) => `
Analyze the resume against the provided job description skills.

IMPORTANT:
- Use semantic understanding, not exact keyword matching
- Equivalent tools, terminology, or implied usage counts as a match
- Skills from must_have are higher priority than nice_to_have

Semantic matching examples (NOT exhaustive):
- "VS Code" → "Visual Studio Code", "IDE", "code editor"
- "React" → "React.js", "React components", "hooks"
- "Node.js" → "Node", "Express", "backend JavaScript"
- "REST APIs" → "RESTful services", "HTTP APIs"
- "PostgreSQL" → "Postgres", "relational database", "SQL database"
- "Docker" → "containerization", "Dockerfile", "containers"

CLASSIFICATION RULES:
- present:
  - Skill is clearly used in experience or projects OR
  - Mentioned multiple times OR
  - Strongly implied by responsibilities or tools
- weak:
  - Skill mentioned once OR
  - Indirect or shallow reference without clear usage
- missing:
  - Skill not mentioned and not implied semantically

Job Skills (must_have):
${JSON.stringify(jdSkills.must_have, null, 2)}

Job Skills (nice_to_have):
${JSON.stringify(jdSkills.nice_to_have, null, 2)}

Resume Content:
${resumeText}

Classify EVERY skill above and respond in EXACTLY this format:
{
  "present": ["Skill Name"],
  "weak": ["Skill Name"],
  "missing": ["Skill Name"]
}
`
        }

};
