// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/authContext";

// const Login = () => {
//   const { login } = useAuth();
//   const navigate = useNavigate();
//   const [form, setForm] = useState({ email: "", password: "" });
//   const [message, setMessage] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//     if (message) setMessage("");
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setMessage("");
//     setLoading(true);

//     try {
//       const res = await fetch("http://localhost:5000/api/auth/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(form),
//       });

//       const data = await res.json();
//       if (res.ok) {
//         setMessage("Login successful! Loading your profile...");
//         setTimeout(() => {
//           login(data.user, data.token);
//         }, 1000);
//       } else {
//         setMessage(data.message || "Login failed. Please check your credentials.");
//       }
//     } catch (err) {
//       setMessage("Server error. Please check your connection and try again.");
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDemoLogin = async () => {
//     setForm({ email: "demo@example.com", password: "demo123" });
//     setMessage("Using demo credentials...");
//   };

//   return (
//     <div className="min-h-screen relative overflow-hidden font-body">

//       <div className="absolute inset-0 bg-gradient-to-br from-[#2D1B13] via-[#4E342E] to-[#6D4C41]">

//         <div 
//           className="absolute inset-0 opacity-20"
//           style={{
//             backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23D7CCC8' fill-opacity='0.08'%3E%3Cpath d='M20 20.5V18H0V6h20V4H0v16.5zM0 20.5V37h20V24.5H0z'/%3E%3C/g%3E%3C/svg%3E")`,
//             backgroundSize: '30px 30px'
//           }}
//         />


//         <div className="absolute inset-0">
//           <div className="absolute top-0 left-1/3 w-1 h-full bg-gradient-to-b from-[#C9A227]/15 via-transparent to-transparent transform rotate-6 animate-pulse"></div>
//           <div className="absolute top-0 right-1/3 w-1 h-full bg-gradient-to-b from-[#C9A227]/10 via-transparent to-transparent transform -rotate-6 animate-pulse delay-700"></div>
//         </div>


//         <div className="absolute inset-0 overflow-hidden pointer-events-none">
//           {[...Array(4)].map((_, i) => (
//             <div
//               key={i}
//               className="absolute w-1 h-1 bg-[#D7CCC8]/20 rounded-full animate-float"
//               style={{
//                 left: `${25 + i * 20}%`,
//                 top: `${15 + i * 15}%`,
//                 animationDelay: `${i * 2.5}s`,
//                 animationDuration: `${6 + i}s`
//               }}
//             />
//           ))}
//         </div>
//       </div>


//       <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
//         <div className="w-full max-w-md">


//           <div className="bg-[#FDF6EC]/10 backdrop-blur-xl border-2 border-[#C9A227]/40 rounded-2xl p-8 shadow-2xl shadow-[#4E342E]/50 relative ">

//             <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-[#C9A227] rounded-tl-lg"></div>
//             <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-[#C9A227] rounded-tr-lg"></div>
//             <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-[#C9A227] rounded-bl-lg"></div>
//             <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-[#C9A227] rounded-br-lg"></div>


//             <div className="text-center mb-6">
//               <h2 className="font-heading text-3xl font-bold text-[#FDF6EC] mb-2 drop-shadow-lg">
//                 Welcome Back
//               </h2>
//               <p className="text-[#D7CCC8] text-sm">
//                 Sign in to continue your typing mastery
//               </p>
//             </div>


//             {message && (
//               <div className={`text-center font-medium mb-4 p-3 rounded-lg backdrop-blur-sm ${
//                 message.includes("successful") || message.includes("Loading")
//                   ? "text-[#C9A227] bg-[#C9A227]/10 border border-[#C9A227]/30"
//                   : "text-[#FF6B6B] bg-[#FF6B6B]/10 border border-[#FF6B6B]/30"
//               }`}>
//                 {message.includes("Loading") && (
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#C9A227] inline-block mr-2"></div>
//                 )}
//                 {message}
//               </div>
//             )}

//             {/* Login Form */}
//             <form className="flex flex-col gap-4" onSubmit={handleLogin}>
//               <div>
//                 <input
//                   type="email"
//                   name="email"
//                   placeholder="Email Address"
//                   value={form.email}
//                   onChange={handleChange}
//                   required
//                   disabled={loading}
//                   className="w-full p-4 bg-[#4E342E]/60 backdrop-blur-sm border border-[#6D4C41] rounded-xl 
//                            focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227]
//                            text-[#FDF6EC] placeholder-[#D7CCC8]/70 
//                            disabled:opacity-50 disabled:cursor-not-allowed
//                            transition-all duration-300
//                            hover:border-[#C9A227]/70"
//                 />
//               </div>

//               <div>
//                 <input
//                   type="password"
//                   name="password"
//                   placeholder="Password"
//                   value={form.password}
//                   onChange={handleChange}
//                   required
//                   disabled={loading}
//                   className="w-full p-4 bg-[#4E342E]/60 backdrop-blur-sm border border-[#6D4C41] rounded-xl 
//                            focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227]
//                            text-[#FDF6EC] placeholder-[#D7CCC8]/70 
//                            disabled:opacity-50 disabled:cursor-not-allowed
//                            transition-all duration-300
//                            hover:border-[#C9A227]/70"
//                 />
//               </div>

//               {/* Login Button - Wooden Engraved Style */}
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="group w-full py-4 bg-gradient-to-r from-[#C9A227] to-[#B8941F] text-[#1C1C1C] 
//                          font-semibold rounded-full transition-all duration-300 
//                          shadow-lg shadow-[#C9A227]/30 hover:shadow-xl hover:shadow-[#C9A227]/40 
//                          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg
//                          transform hover:scale-[1.02] active:scale-[0.98]
//                          flex items-center justify-center gap-2 relative overflow-hidden"
//               >
//                 {/* Subtle shimmer effect */}
//                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FDF6EC]/20 to-transparent 
//                                transform -skew-x-12 -translate-x-full group-hover:translate-x-full 
//                                transition-transform duration-1000"></div>

//                 {loading ? (
//                   <>
//                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#1C1C1C]"></div>
//                     Signing In...
//                   </>
//                 ) : (
//                   "Enter"
//                 )}
//               </button>
//             </form>

//             {/* Benefits Section - Wooden Panel Style */}
//             <div className="mt-6 p-4 bg-[#4E342E]/30 backdrop-blur-sm border border-[#6D4C41]/50 rounded-xl">
//               <p className="text-[#C9A227] text-sm font-semibold mb-3 flex items-center gap-2">
//                 <span>✨</span> Master's Benefits:
//               </p>
//               <ul className="text-xs text-[#D7CCC8] space-y-2">
//                 <li className="flex items-center gap-3 p-1">
//                   <span className="text-[#C9A227] text-sm">📊</span>
//                   <span>Track your typing progress and statistics</span>
//                 </li>
//                 <li className="flex items-center gap-3 p-1">
//                   <span className="text-[#C9A227] text-sm">🏆</span>
//                   <span>Compete in the Leaderboard</span>
//                 </li>
//                 <li className="flex items-center gap-3 p-1">
//                   <span className="text-[#C9A227] text-sm">⚔️</span>
//                   <span>Challenge fellow members</span>
//                 </li>
//                 <li className="flex items-center gap-3 p-1">
//                   <span className="text-[#C9A227] text-sm">🎯</span>
//                   <span>Set personal achievements</span>
//                 </li>
//               </ul>
//             </div>

//             {/* Navigation Options */}
//             <div className="text-center mt-6 space-y-3">
//               <p className="text-sm text-[#D7CCC8]">
//                 New to the team?{" "}
//                 <span
//                   onClick={() => navigate("/signup")}
//                   className="text-[#C9A227] hover:text-[#FDF6EC] cursor-pointer font-semibold 
//                            transition-colors duration-300 hover:unde`rline"
//                 >
//                   Join here
//                 </span>
//               </p>

//               <p className="text-xs text-[#D7CCC8]/70">
//                 Want to practice first?{" "}
//                 <span
//                   onClick={() => navigate("/game")}
//                   className="text-[#D7CCC8] hover:text-[#C9A227] cursor-pointer transition-colors duration-300"
//                 >
//                   Train as guest
//                 </span>
//               </p>
//             </div>

//             {/* Optional: Demo Login Button for Development */}
//             {process.env.NODE_ENV === 'development' && (
//               <div className="mt-4 text-center">
//                 <button
//                   onClick={handleDemoLogin}
//                   className="text-xs text-[#D7CCC8]/60 hover:text-[#C9A227] transition-colors duration-300"
//                 >
//                   Fill demo credentials
//                 </button>
//               </div>
//             )}
//           </div>

//           {/* Back to Home Link */}
//           <div className="text-center mt-6">
//             <button
//               onClick={() => navigate("/")}
//               className="text-[#D7CCC8]/70 hover:text-[#C9A227] text-sm transition-colors duration-300 
//                        flex items-center gap-2 mx-auto"
//             >
//               <span>←</span> Back to Home
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Custom Animations */}
//       <style jsx>{`
//         @keyframes float {
//           0%, 100% {
//             transform: translateY(0px) translateX(0px);
//             opacity: 0.2;
//           }
//           50% {
//             transform: translateY(-15px) translateX(8px);
//             opacity: 0.6;
//           }
//         }

//         .animate-float {
//           animation: float 6s ease-in-out infinite;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default Login;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (message) setMessage("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Login successful! Loading your profile...");
        setTimeout(() => {
          login(data.user, data.token);
        }, 1000);
      } else {
        setMessage(data.message || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      setMessage("Server error. Please check your connection and try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setForm({ email: "demo@example.com", password: "demo123" });
    setMessage("Using demo credentials...");
  };

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden font-body">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2D1B13] via-[#4E342E] to-[#6D4C41]">
        {/* Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23D7CCC8' fill-opacity='0.08'%3E%3Cpath d='M20 20.5V18H0V6h20V4H0v16.5zM0 20.5V37h20V24.5H0z'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '30px 30px'
          }}
        />

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-[#D7CCC8]/20 rounded-full animate-float"
              style={{
                left: `${25 + i * 20}%`,
                top: `${15 + i * 15}%`,
                animationDelay: `${i * 2.5}s`,
                animationDuration: `${6 + i}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 h-full w-full flex items-center justify-center p-2 sm:p-4">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="bg-[#FDF6EC]/12 backdrop-blur-xl border-2 border-[#C9A227]/40 rounded-2xl p-4 sm:p-6 shadow-2xl shadow-[#4E342E]/50 relative">
            {/* Corner Decorations */}
            <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-[#C9A227] rounded-tl-lg"></div>
            <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-[#C9A227] rounded-tr-lg"></div>
            <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-[#C9A227] rounded-bl-lg"></div>
            <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-[#C9A227] rounded-br-lg"></div>

            {/* Header */}
            <div className="text-center mb-3 sm:mb-4">
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#FDF6EC] mb-1 drop-shadow-lg">
                Welcome Back
              </h2>
              <p className="text-[#D7CCC8] text-xs sm:text-sm">
                Sign in to continue your typing mastery
              </p>
            </div>

            {/* Message Alert */}
            {message && (
              <div className={`text-center text-xs sm:text-sm font-medium mb-3 p-2 rounded-lg backdrop-blur-sm ${message.includes("successful") || message.includes("Loading")
                  ? "text-[#C9A227] bg-[#C9A227]/10 border border-[#C9A227]/30"
                  : "text-[#FF6B6B] bg-[#FF6B6B]/10 border border-[#FF6B6B]/30"
                }`}>
                {message.includes("Loading") && (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#C9A227] inline-block mr-2"></div>
                )}
                {message}
              </div>
            )}

            {/* Login Form */}
            <form className="flex flex-col gap-2.5 sm:gap-3" onSubmit={handleLogin}>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full p-2.5 sm:p-3 bg-[#4E342E]/60 backdrop-blur-sm border border-[#6D4C41] rounded-xl 
                         focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227]
                         text-sm text-[#FDF6EC] placeholder-[#D7CCC8]/70 
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-300 hover:border-[#C9A227]/70
                         autofill:shadow-[inset_0_0_0px_1000px_rgb(78,52,46)] autofill:[-webkit-text-fill-color:#FDF6EC]"
              />


              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full p-2.5 sm:p-3 bg-[#4E342E]/60 backdrop-blur-sm border border-[#6D4C41] rounded-xl 
                         focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227]
                         text-sm text-[#FDF6EC] placeholder-[#D7CCC8]/70 
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-300 hover:border-[#C9A227]/70
                         autofill:shadow-[inset_0_0_0px_1000px_rgb(78,52,46)] autofill:[-webkit-text-fill-color:#FDF6EC]"
              />

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="group w-full py-2.5 sm:py-3 bg-gradient-to-r from-[#C9A227] to-[#B8941F] text-[#1C1C1C] 
                         text-sm font-semibold rounded-full transition-all duration-300 
                         shadow-lg shadow-[#C9A227]/30 hover:shadow-xl hover:shadow-[#C9A227]/40 
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg
                         transform hover:scale-[1.02] active:scale-[0.98]
                         flex items-center justify-center gap-2 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FDF6EC]/20 to-transparent 
                               transform -skew-x-12 -translate-x-full group-hover:translate-x-full 
                               transition-transform duration-1000"></div>

                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#1C1C1C]"></div>
                    <span>Signing In...</span>
                  </>
                ) : (
                  "Enter"
                )}
              </button>
            </form>

            {/* Benefits Section */}
            <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-[#4E342E]/30 backdrop-blur-sm border border-[#6D4C41]/50 rounded-xl">
              <p className="text-[#C9A227] text-xs font-semibold mb-1.5 flex items-center gap-2">
                <span>✨</span> Master's Benefits:
              </p>
              <ul className="text-xs text-[#D7CCC8] space-y-1">
                <li className="flex items-center gap-2">
                  <span className="text-[#C9A227]">📊</span>
                  <span>Track your progress</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#C9A227]">🏆</span>
                  <span>Compete in Leaderboard</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#C9A227]">⚔️</span>
                  <span>Challenge members</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#C9A227]">🎯</span>
                  <span>Set achievements</span>
                </li>
              </ul>
            </div>

            {/* Navigation Options */}
            <div className="text-center mt-3 sm:mt-4 space-y-1.5">
              <p className="text-xs sm:text-sm text-[#D7CCC8]">
                New to the team?{" "}
                <span
                  onClick={() => navigate("/signup")}
                  className="text-[#C9A227] hover:text-[#FDF6EC] cursor-pointer font-semibold 
                           transition-colors duration-300 hover:underline"
                >
                  Join here
                </span>
              </p>

              <p className="text-xs text-[#D7CCC8]/70">
                Want to practice first?{" "}
                <span
                  onClick={() => navigate("/game")}
                  className="text-[#D7CCC8] hover:text-[#C9A227] cursor-pointer transition-colors duration-300"
                >
                  Train as guest
                </span>
              </p>
            </div>

            {/* Demo Login Button */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-2 text-center">
                <button
                  onClick={handleDemoLogin}
                  className="text-xs text-[#D7CCC8]/60 hover:text-[#C9A227] transition-colors duration-300"
                >
                  Fill demo credentials
                </button>
              </div>
            )}
          </div>

          {/* Back to Home Link */}
          <div className="text-center mt-3 sm:mt-4">
            <button
              onClick={() => navigate("/")}
              className="text-[#D7CCC8]/70 hover:text-[#C9A227] text-xs sm:text-sm transition-colors duration-300 
                       flex items-center gap-2 mx-auto"
            >
              <span>←</span> Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-15px) translateX(8px);
            opacity: 0.6;
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        /* Hide scrollbar globally */
        :global(body) {
          overflow: hidden !important;
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        :global(body::-webkit-scrollbar) {
          display: none;
        }

        :global(html) {
          overflow: hidden !important;
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        :global(html::-webkit-scrollbar) {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default Login;




