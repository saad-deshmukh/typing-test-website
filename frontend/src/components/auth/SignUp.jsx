import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (message) setMessage("");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Signup successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setMessage(data.message || "Signup failed. Check if email or username is already used.");
      }
    } catch (err) {
      setMessage("Server error. Try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden font-body">
      {/* Vintage Wooden Background with Sunlight Animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2D1B13] via-[#4E342E] to-[#6D4C41]">
        {/* Wooden Texture Overlay */}
        <div 
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23D7CCC8' fill-opacity='0.06'%3E%3Cpath d='M25 30V20H15V10h10V0h10v10h10v10H35v10h-10z'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '35px 35px'
          }}
        />
        
        {/* Animated Sunlight Beams */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-[#C9A227]/18 via-transparent to-transparent transform rotate-8 animate-pulse"></div>
          <div className="absolute top-0 right-1/4 w-1 h-full bg-gradient-to-b from-[#C9A227]/12 via-transparent to-transparent transform -rotate-8 animate-pulse delay-500"></div>
          <div className="absolute top-0 left-2/3 w-1 h-full bg-gradient-to-b from-[#C9A227]/10 via-transparent to-transparent transform rotate-12 animate-pulse delay-1000"></div>
        </div>

        {/* Floating Dust Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-[#D7CCC8]/25 rounded-full animate-float"
              style={{
                left: `${15 + i * 18}%`,
                top: `${10 + i * 12}%`,
                animationDelay: `${i * 2.2}s`,
                animationDuration: `${7 + i}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          
          {/* Signup Card - Glassmorphism with Wooden Style */}
          <div className="bg-[#FDF6EC]/12 backdrop-blur-xl border-2 border-[#C9A227]/40 rounded-2xl p-8 shadow-2xl shadow-[#4E342E]/60 relative">
            {/* Decorative Brass Corners */}
            <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-[#C9A227] rounded-tl-lg"></div>
            <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-[#C9A227] rounded-tr-lg"></div>
            <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-[#C9A227] rounded-bl-lg"></div>
            <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-[#C9A227] rounded-br-lg"></div>

            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="font-heading text-3xl font-bold text-[#FDF6EC] mb-2 drop-shadow-lg">
                Sign Up
              </h2>
              <p className="text-[#D7CCC8] text-sm leading-relaxed">
                Create your account to embark on your typing mastery journey, compete with fellow craftsmen, and climb the leaderboards!
              </p>
            </div>

            {/* Enhanced Message Display */}
            {message && (
              <div className={`text-center font-medium mb-4 p-3 rounded-lg backdrop-blur-sm ${
                message.includes("successful") || message.includes("Redirecting")
                  ? "text-[#C9A227] bg-[#C9A227]/15 border border-[#C9A227]/40"
                  : "text-[#FF6B6B] bg-[#FF6B6B]/15 border border-[#FF6B6B]/40"
              }`}>
                {loading && message.includes("successful") && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#C9A227] inline-block mr-2"></div>
                )}
                {message}
              </div>
            )}

            {/* Signup Form */}
            <form className="flex flex-col gap-4" onSubmit={handleSignup}>
              <div>
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={form.username}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full p-4 bg-[#4E342E]/60 backdrop-blur-sm border border-[#6D4C41] rounded-xl 
                           focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227]
                           text-[#FDF6EC] placeholder-[#D7CCC8]/70 
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-all duration-300
                           hover:border-[#C9A227]/70"
                />
              </div>

              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full p-4 bg-[#4E342E]/60 backdrop-blur-sm border border-[#6D4C41] rounded-xl 
                           focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227]
                           text-[#FDF6EC] placeholder-[#D7CCC8]/70 
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-all duration-300
                           hover:border-[#C9A227]/70"
                />
              </div>

              <div>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full p-4 bg-[#4E342E]/60 backdrop-blur-sm border border-[#6D4C41] rounded-xl 
                           focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227]
                           text-[#FDF6EC] placeholder-[#D7CCC8]/70 
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-all duration-300
                           hover:border-[#C9A227]/70"
                />
              </div>

              {/* Signup Button - Wooden Engraved Style */}
              <button
                type="submit"
                disabled={loading}
                className="group w-full py-4 bg-gradient-to-r from-[#C9A227] to-[#B8941F] text-[#1C1C1C] 
                         font-bold rounded-full transition-all duration-300 
                         shadow-lg shadow-[#C9A227]/40 hover:shadow-xl hover:shadow-[#C9A227]/50 
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg
                         transform hover:scale-[1.02] active:scale-[0.98]
                         flex items-center justify-center gap-2 relative overflow-hidden"
              >
                {/* Subtle shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FDF6EC]/25 to-transparent 
                               transform -skew-x-12 -translate-x-full group-hover:translate-x-full 
                               transition-transform duration-1000"></div>
                
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#1C1C1C]"></div>
                    Creating Account...
                  </>
                ) : (
                  "Begin Your Journey"
                )}
              </button>
            </form>

            {/* Benefits Section - Wooden Panel Style */}
            <div className="mt-6 p-4 bg-[#4E342E]/30 backdrop-blur-sm border border-[#6D4C41]/50 rounded-xl">
              <p className="text-[#C9A227] text-sm font-semibold mb-3 flex items-center gap-2">
                <span>🎖️</span> Member Benefits:
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs text-[#D7CCC8]">
                <div className="flex items-center gap-2 p-1">
                  <span className="text-[#C9A227] text-sm">📈</span>
                  <span>Progress Tracking</span>
                </div>
                <div className="flex items-center gap-2 p-1">
                  <span className="text-[#C9A227] text-sm">🏆</span>
                  <span>Leaderboard Access</span>
                </div>
                <div className="flex items-center gap-2 p-1">
                  <span className="text-[#C9A227] text-sm">⚔️</span>
                  <span>Multiplayer Battles</span>
                </div>
                <div className="flex items-center gap-2 p-1">
                  <span className="text-[#C9A227] text-sm">🎯</span>
                  <span>Personal Goals</span>
                </div>
              </div>
            </div>

            {/* Navigation Options */}
            <div className="text-center mt-6">
              <p className="text-sm text-[#D7CCC8]">
                Already a member?{" "}
                <span
                  onClick={() => navigate("/login")}
                  className="text-[#C9A227] hover:text-[#FDF6EC] cursor-pointer font-semibold 
                           transition-colors duration-300 hover:underline"
                >
                  Sign in here
                </span>
              </p>
            </div>
          </div>

          {/* Back to Home Link */}
          <div className="text-center mt-6">
            <button
              onClick={() => navigate("/")}
              className="text-[#D7CCC8]/70 hover:text-[#C9A227] text-sm transition-colors duration-300 
                       flex items-center gap-2 mx-auto"
            >
              <span>←</span> Return to Home
            </button>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.25;
          }
          50% {
            transform: translateY(-18px) translateX(10px);
            opacity: 0.7;
          }
        }
        
        .animate-float {
          animation: float 7s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Signup;
