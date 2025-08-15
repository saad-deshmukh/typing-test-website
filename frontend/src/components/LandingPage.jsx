import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const goSinglePlayer = () => navigate("/game");

  // This function now checks for a user before navigating
  const goMultiplayer = () => {
    if (user) {
      navigate("/multiplayer");
    } else {
      // If no user, redirect to login. You could also show a message.
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 font-mono flex flex-col md:flex-row items-center justify-center p-4">
      <div className="w-full max-w-7xl flex flex-col md:flex-row">
        {/* Left Side: Game Modes */}
        <div className="flex-1 flex flex-col justify-center items-center md:items-start p-8 text-center md:text-left">
          <h1 className="text-5xl md:text-6xl font-bold text-cyan-300 mb-4">
            Typing Challenge
          </h1>
          <p className="text-lg md:text-xl mb-10 max-w-lg text-slate-400">
            Test your speed against the clock or challenge friends in real-time multiplayer battles.
          </p>
          <div className="flex flex-col sm:flex-row gap-6">
            <button
              onClick={goSinglePlayer}
              className="px-8 py-4 bg-cyan-500 text-slate-900 font-bold rounded-lg hover:bg-cyan-400 transition-all duration-300 shadow-lg shadow-cyan-500/20"
            >
              Single Player
            </button>
            <button
              onClick={goMultiplayer} // <-- This is the updated function
              className="px-8 py-4 bg-slate-800 text-cyan-300 font-bold rounded-lg hover:bg-slate-700 border border-slate-700 hover:border-cyan-500 transition-all duration-300"
            >
              Multiplayer
            </button>
          </div>
        </div>

        {/* Right Side: Auth Section (No changes needed here) */}
        <div className="flex-1 flex flex-col justify-center items-center bg-slate-800/50 border border-slate-700 rounded-lg p-8 md:p-16 backdrop-blur-sm mt-8 md:mt-0">
          {user ? (
            <>
              <h2 className="text-3xl font-semibold mb-2 text-slate-300">Welcome back,</h2>
              <p className="text-2xl font-bold text-cyan-300 mb-8">{user.username}!</p>
              <div className="flex flex-col gap-6 w-full max-w-xs">
                <button
                  onClick={logout}
                  className="w-full py-3 bg-slate-700 text-cyan-300 font-semibold rounded-lg hover:bg-slate-600 transition-all duration-300"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-semibold mb-8 text-slate-300">Get Started</h2>
              <div className="flex flex-col gap-6 w-full max-w-xs">
                <button
                  onClick={() => navigate("/login")}
                  className="w-full py-3 bg-slate-700 text-cyan-300 font-semibold rounded-lg hover:bg-slate-600 transition-all duration-300"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="w-full py-3 bg-cyan-500 text-slate-900 font-semibold rounded-lg hover:bg-cyan-400 transition-all duration-300 shadow-lg shadow-cyan-500/20"
                >
                  Sign Up
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
