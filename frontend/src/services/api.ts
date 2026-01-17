import axios from 'axios';
import { UploadResponse, AnalysisResponse, OptimizationResponse } from '../types/api.types';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * API Service
 * Handles all backend API calls
 */
export const apiService = {
    /**
     * Upload resume and job description
     */
    async uploadResume(file: File, jdText: string): Promise<UploadResponse> {
        const formData = new FormData();
        formData.append('resume', file);
        formData.append('jdText', jdText);

        const { data } = await api.post<UploadResponse>('/resume/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return data;
    },

    /**
     * Analyze resume against job description
     */
    async analyzeResume(resumeId: string, jobDescriptionId: string): Promise<AnalysisResponse> {
        const { data } = await api.post<AnalysisResponse>('/resume/analyze', {
            resumeId,
            jobDescriptionId,
        });

        return data;
    },

    /**
     * Get analysis data by ID
     */
    async getAnalysis(analysisId: string): Promise<AnalysisResponse> {
        const { data } = await api.get<AnalysisResponse>(`/resume/analysis/${analysisId}`);
        return data;
    },

    /**
     * Optimize resume based on analysis
     */
    async optimizeResume(analysisId: string): Promise<OptimizationResponse> {
        const { data } = await api.post<OptimizationResponse>('/resume/optimize', {
            analysisId,
        });

        return data;
    },

    /**
     * Get ATS scores for optimized resume
     */
    async getATSScores(optimizedResumeId: string): Promise<{
        success: boolean;
        data: {
            atsScoreBefore: number;
            atsScoreAfter: number;
            improvement: number;
        };
    }> {
        const { data } = await api.get(`/resume/score/${optimizedResumeId}`);
        return data;
    },

    /**
     * Download optimized resume
     */
    getDownloadUrl(optimizedResumeId: string): string {
        return `/api/resume/download/${optimizedResumeId}`;
    },
};
