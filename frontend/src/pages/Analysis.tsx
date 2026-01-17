import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useResumeFlow } from '../hooks/useResumeFlow';
import { AnalysisResponse } from '../types/api.types';
import GapTable from '../components/GapTable';
import ATSScoreCard from '../components/ATSScoreCard';

export default function Analysis() {
    const { id: analysisId } = useParams<{ id: string }>();
    const location = useLocation();
    const { optimizeResume, loading, error, analysisData: hookAnalysisData } = useResumeFlow();
    const [analysisData, setAnalysisData] = useState<AnalysisResponse['data'] | null>(
        location.state?.analysisData || hookAnalysisData || null
    );

    useEffect(() => {
        if (hookAnalysisData && !analysisData) {
            setAnalysisData(hookAnalysisData);
        }
    }, [hookAnalysisData, analysisData]);

    const handleOptimize = () => {
        if (analysisId) {
            optimizeResume(analysisId);
        }
    };

    if (!analysisData) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <p className="text-red-600">Analysis data not available</p>
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
                <ATSScoreCard score={analysisData.atsScoreBefore} title="Current ATS Score" subtitle="Before Optimization" />
            </div>

            {/* Gap Analysis Table */}
            <GapTable gapAnalysis={analysisData.gapAnalysis} />

            {/* Coverage Summary */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="card text-center">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Must-Have Coverage</h3>
                    <p className="text-4xl font-bold text-primary-600">{analysisData.gapAnalysis.coverage.mustHavePercent}%</p>
                </div>
                <div className="card text-center">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Nice-to-Have Coverage</h3>
                    <p className="text-4xl font-bold text-primary-600">{analysisData.gapAnalysis.coverage.niceToHavePercent}%</p>
                </div>
                <div className="card text-center">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Overall Match</h3>
                    <p className="text-4xl font-bold text-primary-600">{analysisData.gapAnalysis.coverage.overall}%</p>
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
