import { Request, Response, NextFunction } from 'express';
import { prisma } from '../server';
import { resumeParserService } from '../services/resumeParser.service';
import { jdParserService } from '../services/jdParser.service';
import { gapAnalysisService } from '../services/gapAnalysis.service';
import { resumeRewriteService } from '../services/resumeRewrite.service';
import { hallucinationValidatorService } from '../services/hallucinationValidator.service';
import { atsScorerService } from '../services/atsScorer.service';
import { resumeRendererService } from '../services/resumeRenderer.service';
import { AppError } from '../middlewares/error.middleware';
import path from 'path';
import fs from 'fs';

/**
 * Resume Controller
 * Handles all resume-related API endpoints
 */
class ResumeController {

    /**
     * Upload resume and job description
     * POST /api/resume/upload
     */
    async uploadResume(req: Request, res: Response, next: NextFunction) {
        try {
            // Check if file was uploaded
            if (!req.file) {
                throw new AppError('No resume file uploaded', 400);
            }

            const { jdText } = req.body;

            if (!jdText || jdText.trim().length === 0) {
                throw new AppError('Job description text is required', 400);
            }

            // Store resume in database
            const resume = await prisma.resume.create({
                data: {
                    filename: req.file.originalname,
                    originalPath: req.file.path
                }
            });

            // Parse and store job description
            const parsedJD = await jdParserService.parseJD(jdText);

            // Validate and store JD requirements in correct format
            // Format: { "Skill Name": "Short description", ... }
            if (!parsedJD.requirements.must_have || !parsedJD.requirements.nice_to_have) {
                throw new AppError('Invalid job description format from parser', 500);
            }

            const jobDescription = await prisma.jobDescription.create({
                data: {
                    resume: {
                        connect: { id: resume.id }
                    },
                    jdText,
                    // Store as JSON - cast to any to avoid type issues with Prisma
                    mustHave: parsedJD.requirements.must_have as any,
                    niceToHave: parsedJD.requirements.nice_to_have as any,
                }
            });

            res.status(201).json({
                success: true,
                data: {
                    resumeId: resume.id,
                    jobDescriptionId: jobDescription.id,
                    message: 'Resume and job description uploaded successfully'
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Analyze resume against job description
     * POST /api/resume/analyze
     */
    async analyzeResume(req: Request, res: Response, next: NextFunction) {
        try {
            const { resumeId, jobDescriptionId } = req.body;

            if (!resumeId || !jobDescriptionId) {
                throw new AppError('resumeId and jobDescriptionId are required', 400);
            }

            // Fetch resume and JD from database
            const resume = await prisma.resume.findUnique({
                where: { id: resumeId }
            });

            const jobDescription = await prisma.jobDescription.findUnique({
                where: { id: jobDescriptionId }
            });

            if (!resume || !jobDescription) {
                throw new AppError('Resume or job description not found', 404);
            }

            // Parse resume
            const parsedResume = await resumeParserService.parseResume(resume.originalPath);

            // Prepare job requirements in correct format
            const jobRequirements = {
                must_have: (jobDescription.mustHave || {}) as Record<string, string>,
                nice_to_have: (jobDescription.niceToHave || {}) as Record<string, string>
            };

            // Perform gap analysis
            const gapAnalysis = await gapAnalysisService.analyzeGap(parsedResume, jobRequirements);

            // Calculate ATS score (before optimization)
            const atsScore = atsScorerService.calculateScore(parsedResume, jobRequirements);

            // Validate score (handle NaN cases)
            const validScore = isNaN(atsScore.after) ? 0 : atsScore.after;

            // Store analysis in database
            const analysis = await prisma.analysis.create({
                data: {
                    resume: {
                        connect: { id: resumeId }
                    },
                    jobDescription: {
                        connect: { id: jobDescriptionId }
                    },
                    present: gapAnalysis.present,
                    weak: gapAnalysis.weak,
                    missing: gapAnalysis.missing,
                    coveragePercent: gapAnalysis.coverage.overall,
                    matchScore: validScore
                }
            });
            console.log("resume analysis");
            
            console.log({
                    analysisId: analysis.id,
                    gapAnalysis,
                    atsScoreBefore: atsScore.after,
                    parsedResume
                });
            
            res.status(200).json({
                success: true,
                data: {
                    analysisId: analysis.id,
                    gapAnalysis,
                    atsScoreBefore: atsScore.after,
                    parsedResume
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Optimize resume based on analysis
     * POST /api/resume/optimize
     */
    async optimizeResume(req: Request, res: Response, next: NextFunction) {
        try {
            const { analysisId } = req.body;

            if (!analysisId) {
                throw new AppError('analysisId is required', 400);
            }

            // Fetch analysis
            const analysis = await prisma.analysis.findUnique({
                where: { id: analysisId },
                include: {
                    resume: true,
                    jobDescription: true
                }
            });

            if (!analysis) {
                throw new AppError('Analysis not found', 404);
            }

            // Parse original resume
            const parsedResume = await resumeParserService.parseResume(
                analysis.resume.originalPath
            );

            // Prepare job requirements from database
            const jobRequirements = {
                must_have: (analysis.jobDescription.mustHave || {}) as Record<string, string>,
                nice_to_have: (analysis.jobDescription.niceToHave || {}) as Record<string, string>
            };

            // Rewrite resume to strengthen weak keywords with job context
            const optimizedContent = await resumeRewriteService.rewriteResume(
                parsedResume,
                analysis.weak,
                analysis.missing,
                jobRequirements
            );

            // Validate for hallucinations
            const validation = await hallucinationValidatorService.validate(
                parsedResume,
                optimizedContent
            );

            // If validation fails, reject optimization
            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Optimization rejected due to hallucinations',
                        details: validation
                    }
                });
            }

            // Calculate new ATS score
            const newAtsScore = atsScorerService.calculateScore(
                { ...parsedResume, sections: optimizedContent.sections },
                {
                    must_have: (analysis.jobDescription.mustHave || {}) as Record<string, string>,
                    nice_to_have: (analysis.jobDescription.niceToHave || {}) as Record<string, string>
                }
            );

            // Validate scores (handle NaN cases)
            const validScoreBefore = isNaN(analysis.matchScore) ? 0 : analysis.matchScore;
            const validScoreAfter = isNaN(newAtsScore.after) ? 0 : newAtsScore.after;

            // Render optimized resume to DOCX
            const outputPath = path.join(
                process.env.UPLOAD_DIR || './uploads',
                `optimized-${Date.now()}.docx`
            );

            const renderedPath = await resumeRendererService.renderToDocx(
                analysis.resume.originalPath,
                optimizedContent,
                outputPath
            );

            // Store optimized resume
            const optimizedResume = await prisma.optimizedResume.create({
                data: {
                    resume: {
                        connect: { id: analysis.resumeId }
                    },
                    analysis: {
                        connect: { id: analysis.id }
                    },
                    optimizedContent: optimizedContent as any,
                    optimizedPath: renderedPath,
                    isValid: validation.isValid,
                    validationMessage: validation.message,
                    atsScoreBefore: validScoreBefore,
                    atsScoreAfter: validScoreAfter
                }
            });

            res.status(200).json({
                success: true,
                data: {
                    optimizedResumeId: optimizedResume.id,
                    validation,
                    atsScoreBefore: analysis.matchScore,
                    atsScoreAfter: newAtsScore.after,
                    atsBreakdown: newAtsScore.breakdown,
                    changedSections: optimizedContent.changedSections,
                    downloadPath: `/api/resume/download/${optimizedResume.id}`
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Download optimized resume
     * GET /api/resume/download/:id
     */
    async downloadResume(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            const optimizedResume = await prisma.optimizedResume.findUnique({
                where: { id }
            });

            if (!optimizedResume || !optimizedResume.optimizedPath) {
                throw new AppError('Optimized resume not found', 404);
            }

            // Check if file exists
            if (!fs.existsSync(optimizedResume.optimizedPath)) {
                throw new AppError('Resume file not found on server', 404);
            }

            // Send file
            res.download(optimizedResume.optimizedPath, `optimized-resume${path.extname(optimizedResume.optimizedPath)}`);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get ATS score details
     * GET /api/resume/score/:id
     */
    async getScore(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            const optimizedResume = await prisma.optimizedResume.findUnique({
                where: { id }
            });

            if (!optimizedResume) {
                throw new AppError('Optimized resume not found', 404);
            }

            res.status(200).json({
                success: true,
                data: {
                    atsScoreBefore: optimizedResume.atsScoreBefore,
                    atsScoreAfter: optimizedResume.atsScoreAfter,
                    improvement: optimizedResume.atsScoreAfter - optimizedResume.atsScoreBefore
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

export const resumeController = new ResumeController();
