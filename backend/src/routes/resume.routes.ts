import { Router } from 'express';
import { upload } from '../middlewares/upload.middleware';
import { resumeController } from '../controllers/resume.controller';

const router = Router();

/**
 * Resume Routes
 */

// Upload resume and job description
router.post('/upload', upload.single('resume'), (req, res, next) => {
    resumeController.uploadResume(req, res, next);
});

// Analyze resume against job description
router.post('/analyze', (req, res, next) => {
    resumeController.analyzeResume(req, res, next);
});

// Optimize resume
router.post('/optimize', (req, res, next) => {
    resumeController.optimizeResume(req, res, next);
});

// Download optimized resume
router.get('/download/:id', (req, res, next) => {
    resumeController.downloadResume(req, res, next);
});

// Get ATS score
router.get('/score/:id', (req, res, next) => {
    resumeController.getScore(req, res, next);
});

export default router;
