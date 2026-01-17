import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { AnalysisResponse } from '../types/api.types';

/**
 * Custom hook for managing resume optimization flow
 */
export const useResumeFlow = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysisData, setAnalysisData] = useState<AnalysisResponse['data'] | null>(null);

    const uploadResume = async (file: File, jdText: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiService.uploadResume(file, jdText);

            if (response.success) {
                // Start analysis automatically
                const analysisResponse = await apiService.analyzeResume(
                    response.data.resumeId,
                    response.data.jobDescriptionId
                );

                if (analysisResponse.success) {
                    setAnalysisData(analysisResponse.data);
                    navigate(`/analysis/${analysisResponse.data.analysisId}`, {
                        state: { analysisData: analysisResponse.data }
                    });
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Failed to upload resume');
        } finally {
            setLoading(false);
        }
    };

    const optimizeResume = async (analysisId: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiService.optimizeResume(analysisId);

            if (response.success) {
                const scoresResponse = await apiService.getATSScores(response.data.optimizedResumeId);
                
                navigate(`/result/${response.data.optimizedResumeId}`, {
                    state: { 
                        optimizedResumeId: response.data.optimizedResumeId,
                        scores: scoresResponse.data 
                    }
                });
            }
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Failed to optimize resume');
        } finally {
            setLoading(false);
        }
    };

    return {
        uploadResume,
        optimizeResume,
        loading,
        error,
        analysisData,
        clearError: () => setError(null),
    };
};
