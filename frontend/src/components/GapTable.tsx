export default function GapTable() {
    // Mock data - in real app this would come from props/API
    const present = ['React', 'TypeScript', 'REST API'];
    const weak = ['Node.js', 'PostgreSQL', 'CI/CD'];
    const missing = ['AWS', 'Docker', 'Kubernetes', 'Microservices'];

    return (
        <div className="card mb-8">
            <h3 className="text-xl font-semibold mb-6">Keyword Gap Analysis</h3>

            <div className="space-y-6">
                {/* Present Keywords */}
                <div>
                    <div className="flex items-center mb-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                        <h4 className="font-semibold text-gray-700">
                            Strong Presence ({present.length})
                        </h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {present.map((keyword) => (
                            <span
                                key={keyword}
                                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                            >
                                {keyword}
                            </span>
                        ))}
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                        These keywords appear multiple times and are well-emphasized
                    </p>
                </div>

                {/* Weak Keywords */}
                <div>
                    <div className="flex items-center mb-3">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                        <h4 className="font-semibold text-gray-700">
                            Weak Presence ({weak.length})
                        </h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {weak.map((keyword) => (
                            <span
                                key={keyword}
                                className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium"
                            >
                                {keyword}
                            </span>
                        ))}
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                        These keywords are mentioned but not emphasized enough - will be strengthened
                    </p>
                </div>

                {/* Missing Keywords */}
                <div>
                    <div className="flex items-center mb-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                        <h4 className="font-semibold text-gray-700">
                            Not Found ({missing.length})
                        </h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {missing.map((keyword) => (
                            <span
                                key={keyword}
                                className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium"
                            >
                                {keyword}
                            </span>
                        ))}
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                        These keywords are not in your resume - they will NOT be added (to prevent hallucinations)
                    </p>
                </div>
            </div>
        </div>
    );
}
