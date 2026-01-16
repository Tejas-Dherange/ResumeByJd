import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useResumeFlow } from '../hooks/useResumeFlow';
import ResumeUploader from '../components/ResumeUploader';
import JDInput from '../components/JDInput';

interface FormData {
    jdText: string;
}

export default function Upload() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const { uploadResume, loading, error, clearError } = useResumeFlow();
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

    const onSubmit = async (data: FormData) => {
        if (!selectedFile) {
            alert('Please select a resume file');
            return;
        }

        await uploadResume(selectedFile, data.jdText);
    };

    return (
        <div className="animate-fade-in">
            <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                    Optimize Your Resume for ATS
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Upload your resume and paste the job description. Our AI will analyze the gap and
                    optimize your resume without adding false information.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-8">
                {/* Error Display */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                        <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                            <p className="text-sm text-red-700 mt-1">{error}</p>
                        </div>
                        <button
                            type="button"
                            onClick={clearError}
                            className="ml-auto text-red-500 hover:text-red-700"
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Resume Upload */}
                <div className="card">
                    <h3 className="text-xl font-semibold mb-4">1. Upload Your Resume</h3>
                    <ResumeUploader onFileSelect={setSelectedFile} selectedFile={selectedFile} />
                </div>

                {/* Job Description Input */}
                <div className="card">
                    <h3 className="text-xl font-semibold mb-4">2. Paste Job Description</h3>
                    <JDInput register={register} errors={errors} />
                </div>

                {/* Submit Button */}
                <div className="flex justify-center">
                    <button
                        type="submit"
                        disabled={loading || !selectedFile}
                        className="btn-primary text-lg px-12 py-4"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Analyzing...
                            </>
                        ) : (
                            'Analyze Resume'
                        )}
                    </button>
                </div>
            </form>

            {/* How It Works */}
            <div className="mt-16 max-w-5xl mx-auto">
                <h3 className="text-2xl font-bold text-center mb-8">How It Works</h3>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl font-bold text-primary-600">1</span>
                        </div>
                        <h4 className="font-semibold mb-2">Upload & Analyze</h4>
                        <p className="text-sm text-gray-600">We parse your resume and extract requirements from the job description</p>
                    </div>
                    <div className="text-center">
                        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl font-bold text-primary-600">2</span>
                        </div>
                        <h4 className="font-semibold mb-2">Gap Analysis</h4>
                        <p className="text-sm text-gray-600">AI identifies which keywords are strong, weak, or missing in your resume</p>
                    </div>
                    <div className="text-center">
                        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl font-bold text-primary-600">3</span>
                        </div>
                        <h4 className="font-semibold mb-2">Optimize & Download</h4>
                        <p className="text-sm text-gray-600">Get an optimized resume with better ATS score while maintaining authenticity</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
