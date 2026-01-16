interface Props {
    score: number;
    title: string;
    subtitle: string;
    highlight?: boolean;
}

export default function ATSScoreCard({ score, title, subtitle, highlight = false }: Props) {
    // Calculate color based on score
    const getScoreColor = () => {
        if (score >= 75) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getProgressColor = () => {
        if (score >= 75) return 'bg-green-600';
        if (score >= 60) return 'bg-yellow-600';
        return 'bg-red-600';
    };

    return (
        <div className={`card ${highlight ? 'ring-4 ring-primary-500 ring-offset-2' : ''}`}>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">{title}</h3>
            <p className="text-sm text-gray-600 mb-4">{subtitle}</p>

            <div className="flex items-center justify-center mb-4">
                <svg className="transform -rotate-90 w-32 h-32">
                    <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-gray-200"
                    />
                    <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - score / 100)}`}
                        className={getProgressColor()}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute">
                    <p className={`text-4xl font-bold ${getScoreColor()}`}>{score}</p>
                </div>
            </div>

            <div className="text-center">
                <p className="text-sm text-gray-600">
                    {score >= 75 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Improvement'}
                </p>
            </div>
        </div>
    );
}
