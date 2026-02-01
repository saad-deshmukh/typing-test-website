import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import statsService from "../services/statsService";
import { User, Target, TrendingUp, Users, Trophy, BarChart3, Award,Rocket } from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  //  states for user stats preview
  const [userStats, setUserStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const goSinglePlayer = () => navigate("/game");

  const goMultiplayer = () => {
    if (user) {
      navigate("/multiplayer");
    } else {
      navigate("/login");
    }
  };

  const goToProfile = () => navigate("/profile");
  const goToLeaderboard = () => navigate("/leaderboard");

  // Fetch stats for logged in user
  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      setLoadingStats(true);
      const data = await statsService.getUserStats();
      setUserStats(data.user);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden font-body">
      <div className="absolute inset-0 bg-gradient-to-br from-[#2D1B13] via-[#4E342E] to-[#6D4C41]">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D7CCC8' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '40px 40px'
          }}
        />

        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-[#C9A227]/20 via-transparent to-transparent transform rotate-12 animate-pulse"></div>
          <div className="absolute top-0 left-3/4 w-1 h-full bg-gradient-to-b from-[#C9A227]/15 via-transparent to-transparent transform -rotate-12 animate-pulse delay-1000"></div>
        </div>

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-[#D7CCC8]/30 rounded-full animate-float"
              style={{
                left: `${20 + i * 15}%`,
                top: `${10 + i * 10}%`,
                animationDelay: `${i * 2}s`,
                animationDuration: `${8 + i}s`
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-8">


          <div className="flex-1 flex flex-col justify-center lg:justify-start items-center lg:items-start p-8 text-center lg:text-left">
            <h1 className="font-heading text-5xl md:text-6xl xl:text-7xl font-bold text-[#FDF6EC] mb-6 drop-shadow-lg">
              <span className="bg-gradient-to-r from-[#C9A227] via-[#FDF6EC] to-[#C9A227] bg-clip-text text-transparent">
                Typing Mastery
              </span>
            </h1>
            <p className="text-lg md:text-xl mb-12 max-w-xl text-[#D7CCC8] leading-relaxed">
              Master the art of typing on this vintage wooden desk, where tradition meets modern technology in perfect harmony.
            </p>


            <div className="flex flex-col sm:flex-row gap-6 mb-10 mt-2">
              <button
                onClick={goSinglePlayer}
                className="group px-8 py-4 bg-gradient-to-br from-[#6D4C41] to-[#4E342E] text-[#FDF6EC] font-semibold rounded-full border-2 border-[#C9A227] hover:border-[#FDF6EC] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover:shadow-[#C9A227]/30"
              >
                <span className="group-hover:text-[#C9A227] transition-colors duration-300 flex items-center gap-1">
                  <Target size={18} />  Solo Practice
                </span>
              </button>
              <button
                onClick={goMultiplayer}
                className="group px-8 py-4 bg-gradient-to-br from-[#4E342E] to-[#2D1B13] text-[#D7CCC8] font-semibold rounded-full border-2 border-[#6D4C41] hover:border-[#C9A227] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span className="group-hover:text-[#C9A227] transition-colors duration-300 flex items-center gap-1">
                  <Users size={18} />  Multiplayer
                </span>
              </button>
            </div>


            <div className="flex flex-col sm:flex-row gap-4">
              {user && (
                <button
                  onClick={goToProfile}
                  className="px-6 py-3 bg-[#4E342E]/80 backdrop-blur-sm text-[#C9A227] font-semibold rounded-lg border border-[#6D4C41] hover:border-[#C9A227] transition-all duration-300 flex items-center gap-2 hover:bg-[#4E342E]/90"
                >
                  <TrendingUp size={18} />
                  View Your Progress
                </button>
              )}
              <button
                onClick={goToLeaderboard}
                className="px-6 py-3 bg-[#4E342E]/80 backdrop-blur-sm text-[#C9A227] font-semibold rounded-lg border border-[#6D4C41] hover:border-[#C9A227] transition-all duration-300 flex items-center gap-2 hover:bg-[#4E342E]/90"
              >
                <Trophy size={18} />
                LeaderBoard
              </button>
            </div>
          </div>


          <div className="flex-1 flex flex-col justify-center items-center lg:items-end">
            <div className="w-full max-w-lg bg-[#FDF6EC]/12 backdrop-blur-xl border border-[#C9A227]/50 rounded-2xl p-8 shadow-2xl shadow-[#4E342E]/50 relative">

              <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-[#C9A227] rounded-tl-lg"></div>
              <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-[#C9A227] rounded-tr-lg"></div>
              <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-[#C9A227] rounded-bl-lg"></div>
              <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-[#C9A227] rounded-br-lg"></div>

              {user ? (
                <>
                  <h2 className="font-heading text-2xl font-semibold mb-2 text-[#FDF6EC]">Welcome back,</h2>
                  <p className="text-2xl font-bold text-[#C9A227] mb-6">{user?.username || "User"}!</p>


                  {loadingStats ? (
                    <div className="mb-6 text-center">
                      <p className="text-[#D7CCC8] text-sm animate-pulse">Retrieving your achievements...</p>
                    </div>
                  ) : userStats && userStats.totalGames > 0 ? (
                    <div className="mb-6 w-full">
                      <div className="bg-[#4E342E]/40 backdrop-blur-sm rounded-xl p-4 border border-[#6D4C41]">
                        <h3 className="font-heading text-lg font-semibold text-[#C9A227] mb-3 text-center">Your Achievements</h3>
                        <div className="grid grid-cols-2 gap-3 text-center">
                          <div className="bg-[#2D1B13]/50 rounded-lg p-3 border border-[#C9A227]/30">
                            <p className="text-2xl font-bold text-[#C9A227]">{userStats.bestWpm}</p>
                            <p className="text-xs text-[#D7CCC8]">Peak Speed</p>
                          </div>
                          <div className="bg-[#2D1B13]/50 rounded-lg p-3 border border-[#C9A227]/30">
                            <p className="text-2xl font-bold text-[#C9A227]">{userStats.bestAccuracy}%</p>
                            <p className="text-xs text-[#D7CCC8]">Best Accuracy</p>
                          </div>
                          <div className="bg-[#2D1B13]/50 rounded-lg p-3 border border-[#C9A227]/30">
                            <p className="text-lg font-bold text-[#C9A227]">{userStats.totalGames}</p>
                            <p className="text-xs text-[#D7CCC8]">Sessions</p>
                          </div>
                          <div className="bg-[#2D1B13]/50 rounded-lg p-3 border border-[#C9A227]/30">
                            <p className="text-lg font-bold text-[#C9A227]">{userStats.averageWpm}</p>
                            <p className="text-xs text-[#D7CCC8]">Avg Speed</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : userStats && userStats.totalGames === 0 ? (
                    <div className="mb-6 text-center">
                      <p className="text-[#D7CCC8] text-sm">Begin your typing journey!</p>
                    </div>
                  ) : null}

                  <div className="flex flex-col gap-4 w-full">
                    <button
                      onClick={goToProfile}
                      className="w-full py-3 bg-gradient-to-r from-[#6D4C41] to-[#4E342E] text-[#FDF6EC] font-semibold rounded-full border border-[#C9A227]/50 hover:border-[#C9A227] transition-all duration-300 hover:shadow-lg hover:shadow-[#C9A227]/20 flex items-center justify-center gap-2"
                    >
                      <User size={18} />
                      View Complete Profile
                    </button>
                    <button
                      onClick={logout}
                      className="w-full py-3 bg-[#2D1B13]/60 text-[#D7CCC8] font-semibold rounded-full border border-[#4E342E] hover:border-[#6D4C41] transition-all duration-300"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="font-heading text-3xl font-semibold mb-6 text-[#FDF6EC] text-center">
                    Sign Up
                  </h2>

                  <div className="mb-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <span className="text-[#C9A227] text-lg">
                        <Rocket />
                      </span>
                      <p className="text-[#D7CCC8] text-sm">
                        Unlock your potential:
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 text-sm text-[#D7CCC8]">
                      <div className="flex items-center gap-3 bg-[#4E342E]/30 rounded-lg p-2">
                        <span className="text-[#C9A227] text-lg">
                          <BarChart3 />
                        </span>
                        <span>Track your typing mastery</span>
                      </div>

                      <div className="flex items-center gap-3 bg-[#4E342E]/30 rounded-lg p-2">
                        <span className="text-[#C9A227] text-lg">
                          <Award />
                        </span>
                        <span>Compete in the Leaderboard</span>
                      </div>

                      <div className="flex items-center gap-3 bg-[#4E342E]/30 rounded-lg p-2">
                        <span className="text-[#C9A227] text-lg">
                          <Users />
                        </span>
                        <span>Challenge fellow typists</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 w-full">
                    <button
                      onClick={() => navigate("/login")}
                      className="w-full py-3 bg-[#2D1B13]/60 text-[#C9A227] font-semibold rounded-full border border-[#4E342E] hover:border-[#C9A227] transition-all duration-300"
                    >
                      Sign In
                    </button>

                    <button
                      onClick={() => navigate("/signup")}
                      className="w-full py-3 bg-gradient-to-r from-[#C9A227] to-[#B8941F] text-[#1C1C1C] font-bold rounded-full transition-all duration-300 shadow-lg shadow-[#C9A227]/30 hover:shadow-xl hover:shadow-[#C9A227]/40 transform hover:scale-105"
                    >
                      Create Account
                    </button>
                  </div>
                </>

              )}
            </div>
          </div>
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
            transform: translateY(-20px) translateX(10px);
            opacity: 0.7;
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
