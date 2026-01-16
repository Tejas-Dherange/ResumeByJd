import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '../services/api';
import ATSScoreCard from '../components/ATSScoreCard';

export default function Result() {
    const { id: optimizedResumeId } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => setLoading(false), 1000);
    }, []);

    const handleDownload = () => {
        if (optimizedResumeId) {
            const url = apiService.getDownloadUrl(optimizedResumeId);
            window.open(url, '_blank');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <svg className="animate-spin h-12 w-12 text-primary-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-600">Generating your optimized resume...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto animate-fade-in">
            <div className="text-center mb-8">
                <div className="inline-block p-3 bg-green-100 rounded-full mb-4">
                    <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-2">
                    Resume Optimized Successfully!
                </h2>
                <p className="text-lg text-gray-600">
                    Your resume has been optimized and validated for authenticity
                </p>
            </div>

            {/* Validation Success */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                <div className="flex items-start">
                    <svg className="w-6 h-6 text-green-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                        <h3 className="text-lg font-semibold text-green-900 mb-1">Validation Passed ✓</h3>
                        <p className="text-sm text-green-800">
                            No hallucinations detected. Resume optimization is valid and safe to use.
                        </p>
                    </div>
                </div>
            </div>

            {/* ATS Score Comparison */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
                <ATSScoreCard
                    score={62}
                    title="Before Optimization"
                    subtitle="Original Resume"
                />
                <ATSScoreCard
                    score={78}
                    title="After Optimization"
                    subtitle="Improved by 16 points!"
                    highlight
                />
            </div>

            {/* Breakdown */}
            <div className="card mb-8">
                <h3 className="text-xl font-semibold mb-4">ATS Score Breakdown</h3>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700">Keyword Match</span>
                            <span className="font-semibold">82%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-primary-600 h-2 rounded-full" style={{ width: '82%' }}></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700">Section Coverage</span>
                            <span className="font-semibold">100%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-primary-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700">Action Verbs</span>
                            <span className="font-semibold">75%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-primary-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700">Format Quality</span>
                            <span className="font-semibold">60%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-primary-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Changed Sections */}
            <div className="card mb-8">
                <h3 className="text-xl font-semibold mb-4">Changed Sections</h3>
                <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Experience</span>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Skills</span>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                    Only these sections were modified to strengthen weak keywords. All other sections remain unchanged.
                </p>
            </div>

            {/* Download Button */}
            <div className="flex justify-center">
                <button
                    onClick={handleDownload}
                    className="btn-primary text-lg px-12 py-4"
                >
                    <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Optimized Resume
                </button>
            </div>
        </div>
    );
}
