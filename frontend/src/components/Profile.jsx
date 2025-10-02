import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import statsService from '../services/statsService';
import StatsChart from './StatsChart';
import { useAuth } from '../context/authContext';
import AIAnalysisModal from './AIAnalysisModal'; // ← ADD THIS LINE

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      const data = await statsService.getUserStats();
      setUserStats(data);
      setError(null);
    } catch (err) {
      setError('Failed to load guild member records');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // **NEW: Handle AI Analysis**
  const handleAIAnalysis = () => {
     setShowAIAnalysis(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden font-body">
        {/* Vintage Wooden Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#2D1B13] via-[#4E342E] to-[#6D4C41]">
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23D7CCC8' fill-opacity='0.08'%3E%3Cpath d='M20 20.5V18H0V6h20V4H0v16.5zM0 20.5V37h20V24.5H0z'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '30px 30px'
            }}
          />
          <div className="absolute top-0 left-1/2 w-1 h-full bg-gradient-to-b from-[#C9A227]/15 via-transparent to-transparent transform rotate-3 animate-pulse"></div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="bg-[#FDF6EC]/10 backdrop-blur-xl border-2 border-[#C9A227]/30 rounded-2xl p-8 shadow-2xl relative">
              <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-[#C9A227] rounded-tl-lg"></div>
              <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-[#C9A227] rounded-tr-lg"></div>
              <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-[#C9A227] rounded-bl-lg"></div>
              <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-[#C9A227] rounded-bl-lg"></div>

              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#6D4C41] border-t-[#C9A227] mx-auto mb-4 shadow-lg shadow-[#C9A227]/20"></div>
              <h3 className="font-heading text-xl font-semibold text-[#FDF6EC] mb-2">Loading Records</h3>
              <p className="text-[#D7CCC8] text-sm">Retrieving your achievements...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen relative overflow-hidden font-body">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2D1B13] via-[#4E342E] to-[#6D4C41]">
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23D7CCC8' fill-opacity='0.08'%3E%3Cpath d='M20 20.5V18H0V6h20V4H0v16.5zM0 20.5V37h20V24.5H0z'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '30px 30px'
            }}
          />
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="bg-[#FDF6EC]/10 backdrop-blur-xl border-2 border-[#FF6B6B]/40 rounded-2xl p-8 shadow-2xl relative">
              <div className="text-[#FF6B6B] text-xl mb-4 font-heading">⚠️ Records Unavailable</div>
              <p className="text-[#D7CCC8] mb-6">{error}</p>
              <button
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-[#C9A227] to-[#B8941F] text-[#1C1C1C] font-bold px-6 py-3 rounded-full 
                         hover:shadow-lg hover:shadow-[#C9A227]/30 transition-all duration-300"
              >
                Return Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { user: userData, recentGames, performanceHistory } = userStats;

  return (
    <div className="min-h-screen relative overflow-hidden font-body">
      {/* Enhanced Vintage Wooden Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2D1B13] via-[#4E342E] to-[#6D4C41]">
        {/* Wooden Texture Overlay */}
        <div 
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23D7CCC8' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '40px 40px'
          }}
        />
        
        {/* Enhanced Animated Sunlight Beams */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-[#C9A227]/20 via-transparent to-transparent transform rotate-12 animate-pulse"></div>
          <div className="absolute top-0 left-3/4 w-1 h-full bg-gradient-to-b from-[#C9A227]/15 via-transparent to-transparent transform -rotate-12 animate-pulse delay-1000"></div>
          <div className="absolute top-0 right-1/3 w-1 h-full bg-gradient-to-b from-[#C9A227]/10 via-transparent to-transparent transform rotate-6 animate-pulse delay-2000"></div>
        </div>

        {/* Floating Dust Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-[#D7CCC8]/30 rounded-full animate-float"
              style={{
                left: `${10 + i * 12}%`,
                top: `${8 + i * 8}%`,
                animationDelay: `${i * 1.5}s`,
                animationDuration: `${8 + i}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="font-heading text-4xl font-bold text-[#FDF6EC] mb-2 drop-shadow-lg">
                <span className="bg-gradient-to-r from-[#C9A227] via-[#FDF6EC] to-[#C9A227] bg-clip-text text-transparent">
                  {userData.username}'s Profile
                </span>
              </h1>
              <p className="text-[#D7CCC8]">member since {new Date(userData.createdAt).toLocaleDateString()}</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="bg-[#4E342E]/80 text-[#C9A227] font-bold px-6 py-3 rounded-full border border-[#6D4C41] 
                       hover:border-[#C9A227] hover:bg-[#4E342E] transition-all duration-300"
            >
              ← Return Home
            </button>
          </div>

          {/* Statistics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Challenges Completed"
              value={userData.totalGames}
              icon="⚔️"
              color="bg-gradient-to-br from-[#C9A227] to-[#B8941F]"
            />
            <StatCard
              title="Peak Mastery"
              value={`${userData.bestWpm} WPM`}
              icon="⚡"
              color="bg-gradient-to-br from-[#6D4C41] to-[#4E342E]"
            />
            <StatCard
              title="Average Speed"
              value={`${userData.averageWpm} WPM`}
              icon="📊"
              color="bg-gradient-to-br from-[#8B5A3C] to-[#6D4C41]"
            />
            <StatCard
              title="Peak Precision"
              value={`${userData.bestAccuracy}%`}
              icon="🎯"
              color="bg-gradient-to-br from-[#A67C5A] to-[#8B5A3C]"
            />
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Total Words Crafted"
              value={userData.totalWordsTyped.toLocaleString()}
              icon="📜"
              color="bg-gradient-to-br from-[#B8941F] to-[#A67C5A]"
            />
            <StatCard
              title="Time in the Forge"
              value={formatTime(userData.totalTimeTyped)}
              icon="⏳"
              color="bg-gradient-to-br from-[#A67C5A] to-[#8B5A3C]"
            />
            <StatCard
              title="Average Precision"
              value={`${userData.averageAccuracy}%`}
              icon="✨"
              color="bg-gradient-to-br from-[#8B5A3C] to-[#6D4C41]"
            />
          </div>

          {/* **NEW: AI Performance Analysis Section** */}
          <div className="bg-[#FDF6EC]/8 backdrop-blur-xl border-2 border-[#C9A227]/40 rounded-2xl p-6 mb-8 shadow-2xl shadow-[#4E342E]/50 relative">
            {/* Decorative Frame */}
            <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-[#C9A227] rounded-tl-lg"></div>
            <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-[#C9A227] rounded-tr-lg"></div>
            <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-[#C9A227] rounded-bl-lg"></div>
            <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-[#C9A227] rounded-br-lg"></div>

            <div className="text-center">
              <h2 className="font-heading text-2xl font-bold text-[#C9A227] mb-3 flex items-center justify-center gap-2">
                <span role="img" aria-hidden="true">🤖</span>
                AI Performance Analysis
              </h2>
              <p className="text-[#D7CCC8] mb-6 max-w-2xl mx-auto">
                Unlock personalized insights about your typing patterns, identify improvement areas, and receive AI-powered recommendations to accelerate your mastery journey.
              </p>

              {/* Condition: Only show if user has sufficient data */}
              {userData.totalGames >= 3 ? (
                <button
                  onClick={handleAIAnalysis}
                  className="group bg-gradient-to-r from-[#C9A227] to-[#B8941F] text-[#1C1C1C] font-bold px-8 py-4 rounded-full 
                           transition-all duration-300 shadow-lg shadow-[#C9A227]/30 hover:shadow-xl hover:shadow-[#C9A227]/40 
                           transform hover:scale-105 relative overflow-hidden"
                  aria-label="Analyze your typing performance using AI"
                >
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FDF6EC]/25 to-transparent 
                                 transform -skew-x-12 -translate-x-full group-hover:translate-x-full 
                                 transition-transform duration-1000"></div>
                  <div className="flex items-center gap-2 relative z-10">
                    <span role="img" aria-hidden="true">🧠</span>
                    <span>Analyze My Performance</span>
                  </div>
                </button>
              ) : (
                <div className="text-center">
                  <button
                    disabled
                    className="bg-[#4E342E]/60 text-[#D7CCC8]/50 font-bold px-8 py-4 rounded-full cursor-not-allowed"
                  >
                    <div className="flex items-center gap-2">
                      <span role="img" aria-hidden="true">🔒</span>
                      <span>Complete More Challenges</span>
                    </div>
                  </button>
                  <p className="text-[#D7CCC8]/70 text-sm mt-2">
                    Complete at least 3 challenges to unlock AI analysis
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Performance Chart */}
          {performanceHistory.length > 0 && (
            <div className="bg-[#FDF6EC]/8 backdrop-blur-xl border-2 border-[#C9A227]/40 rounded-2xl p-6 mb-8 shadow-2xl shadow-[#4E342E]/50 relative">
              {/* Decorative Frame */}
              <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-[#C9A227] rounded-tl-lg"></div>
              <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-[#C9A227] rounded-tr-lg"></div>
              <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-[#C9A227] rounded-bl-lg"></div>
              <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-[#C9A227] rounded-br-lg"></div>

              <h2 className="font-heading text-2xl font-bold text-[#C9A227] mb-4 flex items-center gap-2">
                📈 Mastery Progression
              </h2>
              <div className="bg-[#4E342E]/40 backdrop-blur-sm border border-[#6D4C41] rounded-xl p-4">
                <StatsChart data={performanceHistory} />
              </div>
            </div>
          )}

          {/* Recent Games */}
          <div className="bg-[#FDF6EC]/8 backdrop-blur-xl border-2 border-[#C9A227]/40 rounded-2xl p-6 shadow-2xl shadow-[#4E342E]/50 relative">
            {/* Decorative Frame */}
            <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-[#C9A227] rounded-tl-lg"></div>
            <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-[#C9A227] rounded-tr-lg"></div>
            <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-[#C9A227] rounded-bl-lg"></div>
            <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-[#C9A227] rounded-br-lg"></div>

            <h2 className="font-heading text-2xl font-bold text-[#C9A227] mb-4 flex items-center gap-2">
              📋 Recent Activities
            </h2>
            {recentGames.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎯</div>
                <p className="text-[#D7CCC8] text-lg mb-6">No challenges completed yet, craftsman.</p>
                <button
                  onClick={() => navigate('/game')}
                  className="group bg-gradient-to-r from-[#C9A227] to-[#B8941F] text-[#1C1C1C] font-bold px-8 py-3 rounded-full 
                           transition-all duration-300 shadow-lg shadow-[#C9A227]/30 hover:shadow-xl hover:shadow-[#C9A227]/40 
                           transform hover:scale-105 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FDF6EC]/25 to-transparent 
                                 transform -skew-x-12 -translate-x-full group-hover:translate-x-full 
                                 transition-transform duration-1000"></div>
                  Begin Your Training
                </button>
              </div>
            ) : (
              <div className="bg-[#4E342E]/40 backdrop-blur-sm border border-[#6D4C41] rounded-xl overflow-hidden">
                <div className="overflow-x-auto scrollbar-thin scrollbar-track-[#4E342E] scrollbar-thumb-[#C9A227]">
                  <table className="w-full table-auto">
                    <thead className="bg-[#4E342E]/80 backdrop-blur-sm">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold font-heading text-[#C9A227] uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-left text-sm font-bold font-heading text-[#C9A227] uppercase tracking-wider">Speed</th>
                        <th className="px-6 py-4 text-left text-sm font-bold font-heading text-[#C9A227] uppercase tracking-wider">Precision</th>
                        <th className="px-6 py-4 text-left text-sm font-bold font-heading text-[#C9A227] uppercase tracking-wider">Words</th>
                        <th className="px-6 py-4 text-left text-sm font-bold font-heading text-[#C9A227] uppercase tracking-wider">Duration</th>
                        <th className="px-6 py-4 text-left text-sm font-bold font-heading text-[#C9A227] uppercase tracking-wider">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#6D4C41]/30">
                      {recentGames.map((game, index) => (
                        <tr key={index} className="hover:bg-[#C9A227]/10 transition-colors duration-300">
                          <td className="px-6 py-4 text-[#FDF6EC]">{new Date(game.playedAt).toLocaleDateString()}</td>
                          <td className="px-6 py-4 font-semibold text-[#C9A227]">{game.wpm} WPM</td>
                          <td className="px-6 py-4 text-[#FDF6EC]">{game.accuracy}%</td>
                          <td className="px-6 py-4 text-[#D7CCC8]">{game.wordsTyped}</td>
                          <td className="px-6 py-4 text-[#D7CCC8]">{game.timeTaken}s</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              game.isMultiplayer 
                                ? 'bg-[#C9A227]/20 text-[#C9A227] border border-[#C9A227]/30' 
                                : 'bg-[#6D4C41]/40 text-[#FDF6EC] border border-[#6D4C41]'
                            }`}>
                              {game.isMultiplayer ? '⚔️ Multiplayer Battle' : '🎯 Solo Practice'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) translateX(12px);
            opacity: 0.8;
          }
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }

        /* Custom Wooden Scrollbar */
        .scrollbar-thin::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .scrollbar-track-[\\#4E342E]::-webkit-scrollbar-track {
          background: #4E342E;
          border-radius: 10px;
        }
        
        .scrollbar-thumb-[\\#C9A227]::-webkit-scrollbar-thumb {
          background: #C9A227;
          border-radius: 10px;
          border: 2px solid #4E342E;
        }
        
        .scrollbar-thumb-[\\#C9A227]::-webkit-scrollbar-thumb:hover {
          background: #B8941F;
        }
      `}</style>
       {showAIAnalysis && (
        <AIAnalysisModal
          isOpen={showAIAnalysis}
          onClose={() => setShowAIAnalysis(false)}
          userStats={userStats}
        />
      )}
    </div>
  );
};

// Enhanced Vintage StatCard Component
const StatCard = ({ title, value, icon, color }) => (
  <div className="group bg-[#FDF6EC]/8 backdrop-blur-xl border-2 border-[#C9A227]/30 rounded-2xl p-6 shadow-lg shadow-[#4E342E]/30 
                 hover:shadow-xl hover:shadow-[#4E342E]/50 transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden">
    {/* Decorative Mini Corners */}
    <div className="absolute top-1 left-1 w-2 h-2 border-l border-t border-[#C9A227]/50 rounded-tl-lg"></div>
    <div className="absolute top-1 right-1 w-2 h-2 border-r border-t border-[#C9A227]/50 rounded-tr-lg"></div>
    <div className="absolute bottom-1 left-1 w-2 h-2 border-l border-b border-[#C9A227]/50 rounded-bl-lg"></div>
    <div className="absolute bottom-1 right-1 w-2 h-2 border-r border-b border-[#C9A227]/50 rounded-br-lg"></div>

    {/* Background Shimmer Effect */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#C9A227]/5 to-transparent 
                   transform -skew-x-12 -translate-x-full group-hover:translate-x-full 
                   transition-transform duration-1000"></div>

    <div className="flex items-center relative z-10">
      <div className={`${color} rounded-xl p-4 text-[#1C1C1C] text-2xl mr-4 shadow-lg border border-[#C9A227]/20`}>
        {icon}
      </div>
      <div>
        <p className="text-[#D7CCC8] text-sm font-medium mb-1">{title}</p>
        <p className="text-2xl font-bold text-[#C9A227]">{value}</p>
      </div>
    </div>
  </div>
);

// Helper function to format time in seconds to readable format
const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

export default Profile;
