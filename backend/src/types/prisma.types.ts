import { JobDescription, Analysis, OptimizedResume } from '@prisma/client';

/**
 * Extended Prisma types with proper JSON field typing
 */

/**
 * JobDescription with properly typed JSON fields
 */
export interface JobDescriptionWithTypedJSON extends Omit<JobDescription, 'mustHave' | 'niceToHave'> {
  mustHave: Record<string, string>;      // {"Skill Name": "description"}
  niceToHave: Record<string, string>;    // {"Skill Name": "description"}
}

/**
 * Analysis with properly typed relations
 */
export interface AnalysisWithRelations extends Analysis {
  resume?: any;
  jobDescription?: JobDescriptionWithTypedJSON;
  optimizedResumes?: OptimizedResume[];
}

/**
 * Helper function to cast JobDescription to properly typed version
 */
export function castJobDescriptionTypes(jd: JobDescription): JobDescriptionWithTypedJSON {
  return {
    ...jd,
    mustHave: (jd.mustHave || {}) as Record<string, string>,
    niceToHave: (jd.niceToHave || {}) as Record<string, string>
  };
}
