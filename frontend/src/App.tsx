import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Upload from './pages/Upload';
import Analysis from './pages/Analysis';
import Result from './pages/Result';

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                {/* Header */}
                <header className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <h1 className="text-3xl font-bold text-primary-700">
                            Resume Optimizer
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            AI-Powered ATS Resume Optimization
                        </p>
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Routes>
                        <Route path="/" element={<Upload />} />
                        <Route path="/analysis/:id" element={<Analysis />} />
                        <Route path="/result/:id" element={<Result />} />
                    </Routes>
                </main>

                {/* Footer */}
                <footer className="mt-16 bg-white border-t border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <p className="text-center text-sm text-gray-600">
                            © 2026 Resume Optimizer. Powered by Gemini AI.
                        </p>
                    </div>
                </footer>
            </div>
        </Router>
    );
}

export default App;
