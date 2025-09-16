import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import statsService from '../services/statsService';

const Leaderboard = () => {
  const navigate = useNavigate();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('all');
  const [gameMode, setGameMode] = useState('all');

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe, gameMode]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await statsService.getLeaderboard(timeframe, gameMode);
      setLeaderboardData(data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load guild rankings');
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
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
              <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-[#C9A227] rounded-br-lg"></div>

              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#6D4C41] border-t-[#C9A227] mx-auto mb-4 shadow-lg shadow-[#C9A227]/20"></div>
              <h3 className="font-heading text-xl font-semibold text-[#FDF6EC] mb-2">Loading Rankings</h3>
              <p className="text-[#D7CCC8] text-sm">Retrieving the Leaderboard...</p>
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
              <div className="text-[#FF6B6B] text-xl mb-4 font-heading">⚠️ Guild Archives Unavailable</div>
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
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-[#D7CCC8]/30 rounded-full animate-float"
              style={{
                left: `${15 + i * 15}%`,
                top: `${10 + i * 10}%`,
                animationDelay: `${i * 2}s`,
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
            <div className="text-center flex-1">
              <h1 className="font-heading text-4xl font-bold text-[#FDF6EC] mb-4 drop-shadow-lg">
                <span className="bg-gradient-to-r from-[#C9A227] via-[#FDF6EC] to-[#C9A227] bg-clip-text text-transparent">
                  🏆 Leaderboard
                </span>
              </h1>
              <p className="text-[#D7CCC8]">Witness the legendary masters of the craft!</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="bg-[#4E342E]/80 text-[#C9A227] font-bold px-6 py-3 rounded-full border border-[#6D4C41] 
                       hover:border-[#C9A227] hover:bg-[#4E342E] transition-all duration-300"
            >
              ← Return Home
            </button>
          </div>

          {/* Filters - Guild Control Panel */}
          <div className="bg-[#FDF6EC]/10 backdrop-blur-xl border-2 border-[#C9A227]/30 rounded-2xl p-6 mb-8 shadow-xl shadow-[#4E342E]/50 relative">
            {/* Decorative Corners */}
            <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-[#C9A227] rounded-tl-lg"></div>
            <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-[#C9A227] rounded-tr-lg"></div>
            <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-[#C9A227] rounded-bl-lg"></div>
            <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-[#C9A227] rounded-br-lg"></div>

            <div className="flex flex-wrap gap-8 items-center justify-center">
              <div>
                <label className="block text-sm font-medium text-[#C9A227] mb-2">
                  Time Period
                </label>
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="bg-[#4E342E]/80 border-2 border-[#6D4C41] rounded-lg px-3 py-2 text-[#C9A227] 
                           focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227]
                           transition-all duration-300"
                >
                  <option value="all">All Time Legends</option>
                  <option value="month">This Month</option>
                  <option value="week">This Week</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#C9A227] mb-2">
                  Challenge Type
                </label>
                <select
                  value={gameMode}
                  onChange={(e) => setGameMode(e.target.value)}
                  className="bg-[#4E342E]/80 border-2 border-[#6D4C41] rounded-lg px-3 py-2 text-[#C9A227] 
                           focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227]
                           transition-all duration-300"
                >
                  <option value="all">All Challenges</option>
                  <option value="standard">Solo Mastery</option>
                  <option value="multiplayer">Multiplayer Battles</option>
                </select>
              </div>
            </div>
          </div>

          {/* Leaderboard Table - Wooden Crafted Style */}
          <div className="bg-[#FDF6EC]/8 backdrop-blur-xl border-2 border-[#C9A227]/40 rounded-2xl overflow-hidden shadow-2xl shadow-[#4E342E]/50 relative">
            {/* Decorative Frame */}
            <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-[#C9A227] rounded-tl-lg"></div>
            <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-[#C9A227] rounded-tr-lg"></div>
            <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-[#C9A227] rounded-bl-lg"></div>
            <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-[#C9A227] rounded-br-lg"></div>

            {!Array.isArray(leaderboardData) || leaderboardData.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-[#D7CCC8] text-lg mb-4">📜 No craftsmen found for the selected criteria</div>
                <p className="text-[#D7CCC8]/70 text-sm">The guild archives appear empty for this timeframe.</p>
              </div>
            ) : (
              <div className="overflow-x-auto scrollbar-thin scrollbar-track-[#4E342E] scrollbar-thumb-[#C9A227]">
                <table className="w-full">
                  <thead className="bg-[#4E342E]/80 backdrop-blur-sm">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold font-heading text-[#C9A227] uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold font-heading text-[#C9A227] uppercase tracking-wider">
                        Master Craftsman
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold font-heading text-[#C9A227] uppercase tracking-wider">
                        Peak Speed
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold font-heading text-[#C9A227] uppercase tracking-wider">
                        Average Speed
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold font-heading text-[#C9A227] uppercase tracking-wider">
                        Completed Works
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#6D4C41]/30">
                    {leaderboardData.map((player, index) => {
                      const username = player.username || player.user?.username || 'Unknown Craftsman';
                      
                      // Special styling for top 3
                      const isTopThree = index < 3;
                      const rankColors = {
                        0: 'text-[#FFD700]', // Gold
                        1: 'text-[#C0C0C0]', // Silver  
                        2: 'text-[#CD7F32]'  // Bronze
                      };
                      
                      const bgHighlight = isTopThree ? 'bg-[#C9A227]/10' : '';

                      return (
                        <tr 
                          key={player.id || index} 
                          className={`hover:bg-[#C9A227]/20 transition-colors duration-300 ${bgHighlight}`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {index === 0 && <span className="text-2xl mr-3">🥇</span>}
                              {index === 1 && <span className="text-2xl mr-3">🥈</span>}
                              {index === 2 && <span className="text-2xl mr-3">🥉</span>}
                              <span className={`text-lg font-bold ${isTopThree ? rankColors[index] : 'text-[#C9A227]'}`}>
                                #{index + 1}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div 
                                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold mr-4 border-2 text-[#1C1C1C]
                                  ${isTopThree ? 'bg-gradient-to-br from-[#C9A227] to-[#B8941F] border-[#C9A227]' : 'bg-[#6D4C41] border-[#6D4C41] text-[#FDF6EC]'}`}
                              >
                                {username ? username.charAt(0).toUpperCase() : '?'}
                              </div>
                              <div>
                                <span className={`text-lg font-semibold ${isTopThree ? rankColors[index] : 'text-[#FDF6EC]'}`}>
                                  {username}
                                </span>
                                {isTopThree && (
                                  <div className="text-xs text-[#C9A227]/80">
                                    {index === 0 ? 'Grand Master' : index === 1 ? 'Master' : 'Expert'}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-lg font-bold text-[#C9A227]">
                              {player.bestWpm || 0}
                            </span>
                            <span className="text-sm text-[#D7CCC8]/70 ml-1">WPM</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-lg font-semibold text-[#FDF6EC]">
                              {player.averageWpm || 0}
                            </span>
                            <span className="text-sm text-[#D7CCC8]/70 ml-1">WPM</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-lg font-medium text-[#D7CCC8]">
                              {player.totalGames || 0}
                            </span>
                            <span className="text-sm text-[#D7CCC8]/70 ml-1">works</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Call to Action - Guild Recruitment */}
          <div className="text-center mt-8">
            <div className="bg-[#FDF6EC]/8 backdrop-blur-xl border-2 border-[#C9A227]/30 rounded-2xl p-6 shadow-lg shadow-[#4E342E]/30 mb-6">
              <h3 className="font-heading text-xl font-semibold text-[#FDF6EC] mb-2">
                Ready to Join the Ranks?
              </h3>
              <p className="text-[#D7CCC8] mb-4">
                Test your skills and claim your place among the finest craftsmen!
              </p>
              <button
                onClick={() => navigate('/game')}
                className="group bg-gradient-to-r from-[#C9A227] to-[#B8941F] text-[#1C1C1C] font-bold px-8 py-3 rounded-full 
                         transition-all duration-300 shadow-lg shadow-[#C9A227]/30 hover:shadow-xl hover:shadow-[#C9A227]/40 
                         transform hover:scale-105 relative overflow-hidden"
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FDF6EC]/25 to-transparent 
                               transform -skew-x-12 -translate-x-full group-hover:translate-x-full 
                               transition-transform duration-1000"></div>
                ⚔️ Begin Your Ascension
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations & Styles */}
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
        
        .scrollbar-track-\\[\\#4E342E\\]::-webkit-scrollbar-track {
          background: #4E342E;
          border-radius: 10px;
        }
        
        .scrollbar-thumb-\\[\\#C9A227\\]::-webkit-scrollbar-thumb {
          background: #C9A227;
          border-radius: 10px;
          border: 2px solid #4E342E;
        }
        
        .scrollbar-thumb-\\[\\#C9A227\\]::-webkit-scrollbar-thumb:hover {
          background: #B8941F;
        }

        /* Table Enhancements */
        table {
          border-collapse: separate;
          border-spacing: 0;
        }
      `}</style>
    </div>
  );
};

export default Leaderboard;
