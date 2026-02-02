
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AIAnalysisModal = ({ isOpen, onClose, userStats }) => {
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);

    try {
      // URL to backend server
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/analyze-performance`,
        { userStats },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );    `${import.meta.env.VITE_API_BASE_URL}/auth/login`

      const data = response.data;
      setAnalysis(data.analysis);

    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.message ||
        'Failed to get AI analysis'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !analysis && !loading) {
      handleAnalyze();
    }
  }, [isOpen]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#2D1B13]/90 flex items-center justify-center backdrop-blur-md z-50 p-4">
      <div className="bg-[#FDF6EC]/12 backdrop-blur-xl border-2 border-[#C9A227]/50 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
        {/* Decorative Frame */}
        <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-[#C9A227] rounded-tl-lg"></div>
        <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-[#C9A227] rounded-tr-lg"></div>
        <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-[#C9A227] rounded-bl-lg"></div>
        <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-[#C9A227] rounded-br-lg"></div>

        <div className="p-8">

          <div className="flex justify-between items-center mb-6">
            <h2 className="font-heading text-3xl font-bold text-[#FDF6EC] flex items-center gap-2">
              AI Performance Analysis
            </h2>
            <button
              onClick={onClose}
              className="bg-[#4E342E]/80 text-[#C9A227] font-bold px-4 py-2 rounded-full border border-[#6D4C41] 
                        hover:border-[7] hover:bg-[#4E342E] transition-all duration-300"
              aria-label="Close Analysis Modal"
            >
              ✕ Close
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#6D4C41] border-t-[7] mx-auto mb-4"></div>
              <h3 className="font-heading text-xl font-semibold text-[#FDF6EC] mb-2">
                <span role="img" aria-hidden="true">🧠</span> Analyzing Your Performance
              </h3>
              <p className="text-[#D7CCC8]">AI is reviewing your typing patterns and preparing personalized insights...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="font-heading text-xl font-semibold text-[#FF6B6B] mb-2">Analysis Failed</h3>
              <p className="text-[#D7CCC8] mb-6">{error}</p>
              <button
                onClick={handleAnalyze}
                className="bg-gradient-to-r from-[#C9A227] to-[#B8941F] text-[#1C1C1C] font-bold px-6 py-3 rounded-full 
                          hover:shadow-lg hover:shadow-[#C9A227]/30 transition-all duration-300"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Analysis Results */}
          {analysis && (
            <div className="space-y-6">
              <div className="bg-[#4E342E]/40 backdrop-blur-sm border border-[#6D4C41] rounded-xl p-6">
                <div className="prose prose-invert max-w-none">
                  <div
                    className="text-[#FDF6EC] leading-relaxed whitespace-pre-wrap text-lg"
                    dangerouslySetInnerHTML={{ __html: analysis.replace(/\n/g, '<br>') }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <button
                  onClick={() => navigate('/game')}
                  className="group bg-gradient-to-r from-[#C9A227] to-[#B8941F] text-[#1C1C1C] font-bold px-6 py-3 rounded-full 
                             transition-all duration-300 shadow-lg shadow-[#C9A227]/30 hover:shadow-xl hover:shadow-[#C9A227]/40 
                             transform hover:scale-105 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FDF6EC]/25 to-transparent 
                                 transform -skew-x-12 -translate-x-full group-hover:translate-x-full 
                                 transition-transform duration-1000"></div>
                  Start Practicing
                </button>

                <button
                  onClick={handleAnalyze}
                  className="bg-[#4E342E]/80 text-[#C9A227] font-bold px-6 py-3 rounded-full border border-[#6D4C41] 
                             hover:border-[#C9A227] hover:bg-[#4E342E] transition-all duration-300" >
                  Re-analyze
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisModal;