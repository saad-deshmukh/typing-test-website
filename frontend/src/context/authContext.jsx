import { createContext, useState, useContext, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import statsService from "../services/statsService";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const navigate = useNavigate();

  // Axios instance (cookie based)
  const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}`,
    withCredentials: true,
  });
    

  api.interceptors.response.use(
    response => response,
    error => {
      const isAuthCheck = error.config?.url?.includes("/auth/me");

      if (error.response?.status === 401 && !isAuthCheck) {
        logout();
      }

      return Promise.reject(error);
    }
  );

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const res = await api.get("/auth/me", {
        headers: {
          "Cache-Control": "no-cache",
          "Pragma": "no-cache",
        },
      });

      if (res.data?.user) {
        setUser(res.data.user);
        fetchUserStats(true);
      } else {
        setUser(null);
      }
    } catch (error) {
      //  Handle 401 specifically
      if (error.response?.status === 401) {
        // console.log(' Auth check 401 → Stay logged out');
      }
      setUser(null);  // Always stay logged out on ANY auth failure
    } finally {
      setLoading(false);
    }
  };

  // Login
  const fetchUserStats = async (silent = false) => {
    try {
      if (!silent) setStatsLoading(true);

      const data = await statsService.getUserStats();
      setUserStats(data.user);

      if (data.user && user?.username) {
        const updatedUser = {
          ...user,
          totalGames: data.user.totalGames || user.totalGames || 0,
          bestWpm: data.user.bestWpm || user.bestWpm || 0,
          averageWpm: data.user.averageWpm || user.averageWpm || 0,
          bestAccuracy: data.user.bestAccuracy || user.bestAccuracy || 0,
          averageAccuracy: data.user.averageAccuracy || user.averageAccuracy || 0
        };

        setUser(updatedUser);
      }
    } catch (error) {

      if (error.response?.status === 401 || error.message?.includes('401')) {
        // console.log(' Stats 401 → Auto-logout');
        logout();  // Chain reaction: clears user + stats + navigates
        return;
      }

      console.error("Failed to fetch user stats:", error);
    } finally {
      if (!silent) setStatsLoading(false);
    }
  };

  const login = async (userData) => {
    try {
      setUser(userData);

      setTimeout(() => {
        fetchUserStats(true);
      }, 2000);

      navigate("/");
    } catch (error) {
      console.error("Error during login process:", error);
    }
  };

  // Logout via backend (clears HttpOnly cookie)
  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setUserStats(null);

      //  Clear the typing session so it's fresh for the next person
      sessionStorage.removeItem('typing_game_session');

      // Use 'replace' to prevent the "Back" button from returning to the game
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const refreshUserStats = async () => {
    await fetchUserStats();
  };

  const hasPlayedGames = () => {
    return userStats ? userStats.totalGames > 0 : false;
  };

  const getUserSkillLevel = () => {
    if (!userStats || userStats.totalGames === 0) return "Novice Scribe";

    const avgWpm = parseFloat(userStats.averageWpm || 0);
    const avgAccuracy = parseFloat(userStats.averageAccuracy || 0);

    if (avgWpm >= 80 && avgAccuracy >= 95) return "Grand Master";
    if (avgWpm >= 60 && avgAccuracy >= 90) return "Master Craftsman";
    if (avgWpm >= 40 && avgAccuracy >= 85) return "Skilled Artisan";
    return "Apprentice Writer";
  };

  const value = {
    user,
    loading,
    login,
    logout,
    userStats,
    statsLoading,
    refreshUserStats,
    hasPlayedGames,
    getUserSkillLevel,
    isLoggedIn: !!user,
    username: user?.username || null,
    totalGames: userStats?.totalGames || 0,
    bestWpm: userStats?.bestWpm || 0,
    averageWpm: userStats?.averageWpm || 0,
    bestAccuracy: userStats?.bestAccuracy || 0,
    skillLevel: getUserSkillLevel(),
    api
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen relative overflow-hidden font-body">
          <div className="absolute inset-0 bg-gradient-to-br from-[#2D1B13] via-[#4E342E] to-[#6D4C41]">
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23D7CCC8' fill-opacity='0.08'%3E%3Cpath d='M20 20.5V18H0V6h20V4H0v16.5zM0 20.5V37h20V24.5H0z'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '30px 30px'
            }} />
          </div>
          <div className="relative z-10 min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="bg-[#FDF6EC]/10 backdrop-blur-xl border-2 border-[#C9A227]/30 rounded-2xl p-8 shadow-2xl shadow-[#4E342E]/50 relative max-w-sm">
                <div className="w-16 h-16 bg-gradient-to-br from-[#C9A227] to-[#B8941F] rounded-full mx-auto flex items-center justify-center shadow-lg shadow-[#C9A227]/30 border-2 border-[#FDF6EC]/20 mb-6">
                  <span className="text-2xl text-[#1C1C1C] font-bold">📜</span>
                </div>
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#6D4C41] border-t-[#C9A227] mx-auto shadow-lg shadow-[#C9A227]/20 mb-6"></div>
                <h3 className="font-heading text-xl font-semibold text-[#FDF6EC] mb-2">Initializing Team Access</h3>
                <p className="text-[#D7CCC8] text-sm">Preparing your typing mastery journey...</p>
                <div className="flex justify-center gap-2 mt-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-2 h-2 bg-[#C9A227] rounded-full animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const useUserStats = () => {
  const { userStats, statsLoading, refreshUserStats, hasPlayedGames, skillLevel } = useAuth();
  return {
    stats: userStats,
    loading: statsLoading,
    refresh: refreshUserStats,
    hasPlayedGames: hasPlayedGames(),
    skillLevel,
    gamesPlayed: userStats?.totalGames || 0,
    bestWpm: userStats?.bestWpm || 0,
    averageWpm: userStats?.averageWpm || 0,
    bestAccuracy: userStats?.bestAccuracy || 0,
    averageAccuracy: userStats?.averageAccuracy || 0
  };
};

export const useAuthStatus = () => {
  const { user, loading, isLoggedIn } = useAuth();
  return {
    user,
    loading,
    isLoggedIn,
    isAuthenticated: isLoggedIn,
    username: user?.username
  };
};