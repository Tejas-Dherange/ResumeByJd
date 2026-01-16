import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useResumeFlow } from '../hooks/useResumeFlow';
import { AnalysisResponse } from '../types/api.types';
import GapTable from '../components/GapTable';
import ATSScoreCard from '../components/ATSScoreCard';

export default function Analysis() {
    const { id: analysisId } = useParams<{ id: string }>();
    const { optimizeResume, loading, error } = useResumeFlow();
    const [analysisData, setAnalysisData] = useState<AnalysisResponse['data'] | null>(null);
    const [loadingData, setLoadingData] = useState(true);

    // Mock data fetch - in real app this would come from state or refetch
    useEffect(() => {
        // Since we navigate here with the analysis data, we'd typically pass it via state
        // For now, we'll show mock data after a brief delay
        setTimeout(() => {
            setLoadingData(false);
            // Note: In production, you'd fetch this from the backend or pass via navigation state
        }, 1000);
    }, [analysisId]);

    const handleOptimize = () => {
        if (analysisId) {
            optimizeResume(analysisId);
        }
    };

    if (loadingData) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <svg className="animate-spin h-12 w-12 text-primary-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-600">Analyzing your resume...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Gap Analysis Results</h2>
            <p className="text-gray-600 mb-8">
                Review how your resume matches the job requirements
            </p>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {/* ATS Score Before Optimization */}
            <div className="mb-8">
                <ATSScoreCard score={62} title="Current ATS Score" subtitle="Before Optimization" />
            </div>

            {/* Gap Analysis Table */}
            <GapTable />

            {/* Coverage Summary */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="card text-center">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Must-Have Coverage</h3>
                    <p className="text-4xl font-bold text-primary-600">65%</p>
                </div>
                <div className="card text-center">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Nice-to-Have Coverage</h3>
                    <p className="text-4xl font-bold text-primary-600">45%</p>
                </div>
                <div className="card text-center">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Overall Match</h3>
                    <p className="text-4xl font-bold text-primary-600">58%</p>
                </div>
            </div>

            {/* Optimize Button */}
            <div className="flex justify-center">
                <button
                    onClick={handleOptimize}
                    disabled={loading}
                    className="btn-primary text-lg px-12 py-4"
                >
                    {loading ? 'Optimizing...' : 'Optimize My Resume'}
                </button>
            </div>

            {/* Info Box */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
                <ul className="text-sm text-blue-800 space-y-2">
                    <li>✓ We'll strengthen bullets mentioning weak keywords</li>
                    <li>✓ No new skills will be added - only existing content will be rephrased</li>
                    <li>✓ Your resume structure and design will remain unchanged</li>
                    <li>✓ We'll validate for hallucinations before showing you the result</li>
                </ul>
            </div>
        </div>
    );
}
