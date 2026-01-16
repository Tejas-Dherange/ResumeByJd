import { useCallback } from 'react';

interface Props {
    onFileSelect: (file: File | null) => void;
    selectedFile: File | null;
}

export default function ResumeUploader({ onFileSelect, selectedFile }: Props) {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.name.endsWith('.docx')) {
                alert('Please upload a .docx file');
                return;
            }
            onFileSelect(file);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file && file.name.endsWith('.docx')) {
            onFileSelect(file);
        } else {
            alert('Please upload a .docx file');
        }
    }, [onFileSelect]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    return (
        <div >
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors duration-200 cursor-pointer"
            >
                <input
                    type="file"
                    accept=".docx"
                    onChange={handleFileChange}
                    className="hidden"
                    id="resume-upload"
                />
                <label htmlFor="resume-upload" className="cursor-pointer">
                    {selectedFile ? (
                        <div>
                            <svg className="w-12 h-12 text-green-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-lg font-semibold text-gray-900 mb-1">{selectedFile.name}</p>
                            <p className="text-sm text-gray-600">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <p className="text-sm text-primary-600 mt-2">Click or drag to replace</p>
                        </div>
                    ) : (
                        <div>
                            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="text-lg font-semibold text-gray-700 mb-2">
                                Drop your resume here or click to browse
                            </p>
                            <p className="text-sm text-gray-500">
                                Only .docx files are supported (Max 10MB)
                            </p>
                        </div>
                    )}
                </label>
            </div>
        </div>
    );
}
