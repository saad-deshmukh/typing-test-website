
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import statsService from '../services/statsService';
import { Trophy, Flame, Zap, Sword, Crown, Target, Swords, User, BarChart3, Medal } from "lucide-react"


const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { results, players, gameStats } = location.state || {
    results: [],
    players: [],
    gameStats: null
  };

  const currentPlayerId = useMemo(() => {
    if (!user?.id || !players.length) return null;
    return players.find(p => p.User?.id === user.id)?.id;
  }, [players, user?.id]);


  // New states for enhanced functionality
  const [userStats, setUserStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [showPersonalBest, setShowPersonalBest] = useState(false);

  // Fetch user's updated stats after the game
  useEffect(() => {
    if (user && gameStats) {
      fetchUpdatedUserStats();
    }
  }, [user, gameStats]);

  const fetchUpdatedUserStats = async () => {
    try {
      setLoadingStats(true);
      const data = await statsService.getUserStats();
      setUserStats(data.user);

      // Check if this game set any personal records
      if (gameStats) {
        const isPersonalBest = (
          parseFloat(gameStats.wpm) >= parseFloat(data.user.bestWpm) ||
          parseFloat(gameStats.accuracy) >= parseFloat(data.user.bestAccuracy)
        );
        setShowPersonalBest(isPersonalBest);
      }
    } catch (error) {
      console.error('Error fetching updated stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const getPlayerUsername = (result) => {
    return result.username || 'Unknown Player';
  };



  // Get the current user's result using dynamic playerId
  const getCurrentUserResult = () => {
    if (!user?.id || !results.length) return null;
    const userResult = results.find(r => r.userId == user.id);
    return userResult;
  };

  // Get rank suffix (1st, 2nd, 3rd, etc.)
  const getRankSuffix = (rank) => {
    if (rank === 1) return "st";
    if (rank === 2) return "nd";
    if (rank === 3) return "rd";
    return "th";
  };


  const getRankIcon = (rank) => {
    if (rank === 1) {
      return <Crown size={35} className="text-yellow-400 fill-yellow-400 drop-shadow-md" />;
    }
    if (rank === 2 || rank === 3) {
      const isSilver = rank === 2;

      // Define colors based on rank
      const medalColor = isSilver ? "text-slate-400" : "text-amber-700";
      const medalFill = isSilver ? "fill-slate-100" : "fill-amber-100";
      const badgeBg = isSilver ? "bg-slate-100" : "bg-amber-100";
      const textColor = isSilver ? "text-slate-700" : "text-amber-900";

      return (
        <div className="relative flex items-center justify-center w-[35px] h-[35px]">
          <Medal
            size={35}
            className={`${medalColor} ${medalFill}`}
            strokeWidth={1.5}
          />

          <div
            className={`absolute flex items-center justify-center w-5 h-5 ${badgeBg} rounded-full shadow-sm`}
            style={{
              top: '72.5%',      
              left: '50%',    
              transform: 'translate(-50%, -50%)' 
            }}
          >
            <span className={`text-[11px] font-extrabold ${textColor} leading-none pt-[1px]`}>
              {rank}
            </span>
          </div>
        </div>
      );
    }

    // 4th+ Place: Simple Text
    return <span className="text-xl font-bold text-gray-500">#{rank}</span>;
  };
  // Handle navigation functions
  const handlePlayAgain = () => {
    navigate('/multiplayer');
  };

  const handleViewProfile = () => {
    navigate('/profile');
  };

  const handleViewLeaderboard = () => {
    navigate('/leaderboard');
  };

  if (!results.length) {
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
              <div className="text-[#FF6B6B] text-2xl mb-4 font-heading">⚠️ No Battle Records Found</div>
              <button
                onClick={handlePlayAgain}
                className="bg-gradient-to-r from-[#C9A227] to-[#B8941F] text-[#1C1C1C] font-bold px-6 py-3 rounded-full 
                       hover:shadow-lg hover:shadow-[#C9A227]/30 transition-all duration-300"
              >
                Return to Hall
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentUserResult = getCurrentUserResult();

  const currentUserRank = currentUserResult ? results.findIndex(r => r.id === currentUserResult.id) + 1 : null;


  return (
    <div className="min-h-screen relative overflow-hidden font-body">
      <div className="absolute inset-0 bg-gradient-to-br from-[#2D1B13] via-[#4E342E] to-[#6D4C41]">
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
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-5xl space-y-8">

          {/* Header */}
          <div className="text-center">
            <h1 className="font-heading text-4xl font-bold text-[#FDF6EC] mb-2 drop-shadow-lg flex items-center justify-center gap-3">
              <Trophy size={48} className="text-[#C9A227] drop-shadow-lg [stroke-width:2.5px]" />
              <span className="bg-gradient-to-r from-[#C9A227] via-[#FDF6EC] to-[#C9A227] bg-clip-text text-transparent bg-[length:100%_100%]">
                Battle Complete!
              </span>
            </h1>
            <p className="text-[#D7CCC8] text-lg">The warriors have proven their mettle</p>
          </div>


          {/* Personal Result Highlight (for logged-in users) */}
          {user && currentUserResult && (
            <div className="bg-[#FDF6EC]/10 backdrop-blur-xl border-2 border-[#C9A227]/40 rounded-2xl p-6 shadow-2xl shadow-[#4E342E]/50 relative">
              <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-[#C9A227] rounded-tl-lg"></div>
              <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-[#C9A227] rounded-tr-lg"></div>
              <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-[#C9A227] rounded-bl-lg"></div>
              <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-[#C9A227] rounded-br-lg"></div>

              <div className="text-center">
                <h2 className="font-heading text-2xl font-bold text-[#C9A227] mb-4">Your Standing</h2>
                <div className="flex justify-center items-center gap-8 mb-6">
                  <div className="text-center">
                    <div className="flex justify-center mb-2 h-8">
                      {getRankIcon(currentUserRank)}
                    </div>
                    <p className="text-[#D7CCC8] font-medium">{currentUserRank}{getRankSuffix(currentUserRank)} Position</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-[#C9A227]">{currentUserResult.speed}</p>
                    <p className="text-[#D7CCC8]">Speed (WPM)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-[#C9A227]">{currentUserResult.accuracy}%</p>
                    <p className="text-[#D7CCC8]">Precision</p>
                  </div>
                </div>

                {/* Personal Best Notification */}
                {showPersonalBest && !loadingStats && (
                  <div className="mb-4 p-4 bg-[#C9A227]/20 border-2 border-[#C9A227]/40 rounded-xl backdrop-blur-sm">
                    <p className="text-[#C9A227] font-bold text-lg flex items-center justify-center gap-2">
                       New Personal Mastery Record!!
                    </p>
                  </div>
                )}

                {/* Updated Stats Preview */}
                {userStats && !loadingStats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#4E342E]/40 backdrop-blur-sm border border-[#6D4C41] rounded-xl p-4">
                    <div className="text-center">
                      <p className="text-xl font-bold text-[#C9A227]">{userStats.bestWpm}</p>
                      <p className="text-sm text-[#D7CCC8]">Peak Speed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-[#C9A227]">{userStats.averageWpm}</p>
                      <p className="text-sm text-[#D7CCC8]">Avg Speed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-[#C9A227]">{userStats.bestAccuracy}%</p>
                      <p className="text-sm text-[#D7CCC8]">Peak Precision</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-[#C9A227]">{userStats.totalGames}</p>
                      <p className="text-sm text-[#D7CCC8]">Battles Won</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Results Table */}
          <div className="bg-[#FDF6EC]/8 backdrop-blur-xl border-2 border-[#C9A227]/40 rounded-2xl p-6 shadow-2xl shadow-[#4E342E]/50 relative">
            {/* Decorative Frame */}
            <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-[#C9A227] rounded-tl-lg"></div>
            <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-[#C9A227] rounded-tr-lg"></div>
            <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-[#C9A227] rounded-bl-lg"></div>
            <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-[#C9A227] rounded-br-lg"></div>

            <h2 className="font-heading text-2xl font-bold text-center text-[#C9A227] mb-6 flex items-center justify-center gap-2">
              Final Rankings
            </h2>

            <div className="bg-[#4E342E]/40 backdrop-blur-sm border border-[#6D4C41] rounded-xl overflow-hidden">
              <div className="overflow-x-auto scrollbar-thin scrollbar-track-[#4E342E] scrollbar-thumb-[#C9A227]">
                <table className="w-full text-left">
                  <thead className="bg-[#4E342E]/80 backdrop-blur-sm">
                    <tr>
                      <th className="px-6 py-4 text-sm font-bold font-heading text-[#C9A227] uppercase tracking-wider">Rank</th>
                      <th className="px-6 py-4 text-sm font-bold font-heading text-[#C9A227] uppercase tracking-wider">Member</th>
                      <th className="px-6 py-4 text-sm font-bold font-heading text-[#C9A227] uppercase tracking-wider text-center">Speed (WPM)</th>
                      <th className="px-6 py-4 text-sm font-bold font-heading text-[#C9A227] uppercase tracking-wider text-center">Precision</th>
                      <th className="px-6 py-4 text-sm font-bold font-heading text-[#C9A227] uppercase tracking-wider text-center">Achievement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#6D4C41]/30">
                    {results.map((result, index) => {
                      // Use dynamic currentPlayerId for current user detection
                      const isCurrentUser = user && result.userId === user.id;
                      const rank = index + 1;
                      const isTopThree = rank <= 3;

                      // Special styling for top 3
                      const rankColors = {
                        1: 'text-[#FFD700]', // Gold
                        2: 'text-[#C0C0C0]', // Silver  
                        3: 'text-[#CD7F32]'  // Bronze
                      };

                      const bgHighlight = isCurrentUser
                        ? 'bg-[#C9A227]/20 border-l-4 border-[#C9A227]'
                        : isTopThree
                          ? 'bg-[#C9A227]/10'
                          : '';

                      return (
                        <tr
                          key={result.id}  // Use result.id as key
                          className={`hover:bg-[#C9A227]/20 transition-all duration-300 ${bgHighlight}`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              {getRankIcon(rank)}
                              <span className={`text-lg font-bold ${isTopThree ? rankColors[rank] : 'text-[#C9A227]'} 
                   leading-none tracking-wide`}>
                                #{rank}
                              </span>
                            </div>

                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2
                  ${isCurrentUser
                                  ? 'bg-gradient-to-br from-[#C9A227] to-[#B8941F] text-[#1C1C1C] border-[#C9A227]'
                                  : isTopThree
                                    ? 'bg-[#6D4C41] text-[#FDF6EC] border-[#C9A227]/50'
                                    : 'bg-[#4E342E] text-[#D7CCC8] border-[#6D4C41]'
                                }`}>
                                {getPlayerUsername(result).charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span className={`text-lg font-semibold ${isCurrentUser ? 'text-[#C9A227]' : isTopThree ? rankColors[rank] : 'text-[#FDF6EC]'
                                  }`}>
                                  {getPlayerUsername(result)}  {/* Pass result object */}
                                </span>
                                {isCurrentUser && <span className="text-xs text-[#C9A227]/80 ml-2">(You)</span>}
                                {isTopThree && !isCurrentUser && (
                                  <div className="text-xs text-[#C9A227]/80">
                                    {rank === 1 ? 'Grand Champion' : rank === 2 ? 'Master Craftsman' : 'Expert Artisan'}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="text-xl font-bold text-[#C9A227]">
                              {result.speed}
                            </span>
                            <span className="text-sm text-[#D7CCC8]/70 ml-1">WPM</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="text-xl font-bold text-[#C9A227]">
                              {result.accuracy}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {/* Performance indicator */}
                            <div className="flex items-center justify-center">
                              {result.speed >= 80 && result.accuracy >= 95 &&
                                <span className="inline-flex items-center gap-2 text-[#C9A227] text-sm font-medium whitespace-nowrap">
                                  <Flame /> Legendary
                                </span>
                              }
                              {result.speed >= 60 && result.accuracy >= 90 && result.speed < 80 &&
                                <span className="inline-flex items-center gap-2 text-[#C9A227] text-sm font-medium whitespace-nowrap">
                                  <Sword /> Masterful
                                </span>
                              }
                              {result.speed >= 40 && result.accuracy >= 80 && result.speed < 60 &&
                                <span className="inline-flex items-center gap-2 text-[#C9A227] text-sm font-medium whitespace-nowrap">
                                  <Zap /> Skilled
                                </span>
                              }
                              {(result.speed < 40 || result.accuracy < 80) &&
                                <span className="inline-flex items-center gap-2 text-[#C9A227] text-sm font-medium whitespace-nowrap">
                                  <Target /> Apprentice
                                </span>
                              }
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handlePlayAgain}
              className="group flex items-center gap-2 bg-gradient-to-r from-[#C9A227] to-[#B8941F] text-[#1C1C1C] font-bold px-8 py-4 rounded-full 
               transition-all duration-300 shadow-lg shadow-[#C9A227]/30 hover:shadow-xl hover:shadow-[#C9A227]/40 
               transform hover:scale-105 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FDF6EC]/25 to-transparent 
                    transform -skew-x-12 -translate-x-full group-hover:translate-x-full 
                    transition-transform duration-1000"></div>
              <Swords size={20} className="text-[#151514] flex-shrink-0" /> Challenge Again
            </button>

            {user && (
              <button
                onClick={handleViewProfile}
                className="flex items-center gap-2 bg-[#4E342E]/80 text-[#C9A227] font-bold px-8 py-4 rounded-full border border-[#6D4C41] 
                 hover:border-[#C9A227] hover:bg-[#4E342E] transition-all duration-300"
              >
                <User size={20} className="text-[#C9A227] flex-shrink-0" /> View Profile
              </button>
            )}

            <button
              onClick={handleViewLeaderboard}
              className="flex items-center gap-2 bg-[#4E342E]/80 text-[#C9A227] font-bold px-8 py-4 rounded-full border border-[#6D4C41] 
               hover:border-[#C9A227] hover:bg-[#4E342E] transition-all duration-300"
            >
              <BarChart3 size={20} className="text-[#C9A227] flex-shrink-0" /> Leaderboard
            </button>
          </div>


          {/* Stats Saved Confirmation */}
          {user && gameStats && (
            <div className="text-center">
              <div className="inline-block p-4 bg-[#C9A227]/10 border border-[#C9A227]/30 rounded-xl backdrop-blur-sm">
                <p className="text-[#C9A227] font-medium flex items-center gap-2">
                  <Sparkles size={32} /> Your achievements have been recorded in the chronicles!
                </p>
              </div>
            </div>
          )}

          {/* Guest User Prompt */}
          {!user && (
            <div className="text-center">
              <div className="bg-[#FDF6EC]/8 backdrop-blur-xl border-2 border-[#C9A227]/30 rounded-2xl p-6 shadow-lg shadow-[#4E342E]/30">
                <h3 className="font-heading text-xl font-semibold text-[#FDF6EC] mb-2">
                  Sign Up
                </h3>
                <p className="text-[#D7CCC8] text-sm mb-4">
                  Want to track your progress, compete in rankings, and earn your place among the guild's finest?
                </p>
                <button
                  onClick={() => navigate('/signup')}
                  className="group bg-gradient-to-r from-[#C9A227] to-[#B8941F] text-[#1C1C1C] font-bold px-6 py-3 rounded-full 
                        transition-all duration-300 shadow-lg shadow-[#C9A227]/30 hover:shadow-xl hover:shadow-[#C9A227]/40 
                        transform hover:scale-105 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FDF6EC]/25 to-transparent 
                              transform -skew-x-12 -translate-x-full group-hover:translate-x-full 
                              transition-transform duration-1000"></div>
                  Sign Up
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
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
   `}</style>
    </div>
  );
};

export default ResultsPage;
