import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DOMPurify from 'dompurify'; 

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  
  
  const [validationError, setValidationError] = useState('');
  const [signupAttempts, setSignupAttempts] = useState([]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  // VALIDATION FUNCTIONS
  const validateSignupForm = () => {
    // Username validation
    if (!form.username.trim()) return 'Username is required';
    if (form.username.trim().length < 3) return 'Username must be at least 3 characters';
    if (form.username.trim().length > 20) return 'Username must be 20 characters or less';
    if (!/^[a-zA-Z0-9_-]+$/.test(form.username.trim())) {
      return 'Username can only contain letters, numbers, underscores, and hyphens';
    }
    
    // Email validation
    if (!form.email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return 'Please enter a valid email';
    }
    
    // Password 
    if (!form.password) return 'Password is required';
    if (form.password.length > 8) return 'Password must be 8 characters or less';
    if (form.password.length < 1) return 'Password cannot be empty';
    
    return '';
  };

  const checkRateLimit = () => {
    const now = Date.now();
    const recent = signupAttempts.filter(a => now - a < 5 * 60 * 1000); // 5min window
    
    if (recent.length >= 5) {
      return 'Too many signup attempts. Wait 5 minutes.';
    }
    return '';
  };

  // CHANGE HANDLER
  const handleChange = (e) => {
    const sanitized = DOMPurify.sanitize(e.target.value);
    setForm({ ...form, [e.target.name]: sanitized });
    if (message || validationError) {
      setMessage("");
      setValidationError("");
    }
  };

  // 🛡️ SECURE SIGNUP HANDLER
  const handleSignup = async (e) => {
    e.preventDefault();
    
    // VALIDATION FIRST
    const validationMsg = validateSignupForm();
    if (validationMsg) {
      setValidationError(validationMsg);
      return;
    }
    
    // RATE LIMIT CHECK
    const rateLimitMsg = checkRateLimit();
    if (rateLimitMsg) {
      setValidationError(rateLimitMsg);
      return;
    }
    
    setMessage("");
    setLoading(true);
    const attemptTime = Date.now();
    setSignupAttempts(prev => [...prev.filter(a => attemptTime - a < 5*60*1000), attemptTime]);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/signup",
        { 
          username: form.username.trim(), 
          email: form.email.trim(), 
          password: form.password 
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 10000  //10s timeout
        }
      );

      const data = res.data;
      setMessage("Signup successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
        setSignupAttempts([]);  // Reset on success
      }, 1500);

    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setValidationError('Signup timeout. Please try again.');
      } else if (!err.response) {
        setValidationError('Network error. Check your connection.');
      } else if (err.response.status >= 500) {
        setValidationError('Server error. Try again later.');
      } else {
        setValidationError(err.response?.data?.message || "Signup failed.");
      }
      console.error('Signup error:', err.response?.status); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden font-body">
      <div className="absolute inset-0 bg-gradient-to-br from-[#2D1B13] via-[#4E342E] to-[#6D4C41]">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23D7CCC8' fill-opacity='0.06'%3E%3Cpath d='M25 30V20H15V10h10V0h10v10h10v10H35v10h-10z'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '35px 35px'
          }}
        />
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
      <div className="relative z-10 h-full w-full flex items-center justify-center p-2 sm:p-4">
        <div className="w-full max-w-md">

          <div className="bg-[#FDF6EC]/12 backdrop-blur-xl border-2 border-[#C9A227]/40 rounded-2xl p-4 sm:p-6 shadow-2xl shadow-[#4E342E]/60 relative">
            {/* Decorative Brass Corners */}
            <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-[#C9A227] rounded-tl-lg"></div>
            <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-[#C9A227] rounded-tr-lg"></div>
            <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-[#C9A227] rounded-bl-lg"></div>
            <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-[#C9A227] rounded-br-lg"></div>

            {/* Header */}
            <div className="text-center mb-3 sm:mb-4">
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#FDF6EC] mb-1 drop-shadow-lg">
                Sign Up
              </h2>
              <p className="text-[#D7CCC8] text-sm sm:text-lg leading-relaxed">
                Create your account to embark on your typing mastery journey
              </p>
            </div>

            {/* Validation Error Display */}
            {validationError && (
              <div className="text-red-400 text-xs sm:text-sm font-medium mb-3 p-2 rounded-lg backdrop-blur-sm bg-red-500/10 border border-red-500/30">
                {validationError}
              </div>
            )}

            {/* Message Display */}
            {message && (
              <div className={`text-center text-xs sm:text-sm font-medium mb-3 p-2 rounded-lg backdrop-blur-sm ${
                message.includes("successful") || message.includes("Redirecting")
                  ? "text-[#C9A227] bg-[#C9A227]/15 border border-[#C9A227]/40"
                  : "text-[#FF6B6B] bg-[#FF6B6B]/15 border border-[#FF6B6B]/40"
              }`}>
                {loading && message.includes("successful") && (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#C9A227] inline-block mr-2"></div>
                )}
                {message}
              </div>
            )}

            {/* SIGNUP FORM */}
            <form className="flex flex-col gap-2.5 sm:gap-3" onSubmit={handleSignup}>
              {/*SECURE USERNAME INPUT */}
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
                required
                disabled={loading}
                maxLength={20}
                autoComplete="username"
                spellCheck="false"
                autoCorrect="off"
                aria-invalid={!!validationError}
                className={`w-full p-2.5 sm:p-3 bg-[#4E342E]/60 backdrop-blur-sm border rounded-xl 
                           focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 
                           text-lg text-[#FDF6EC] placeholder-[#D7CCC8]/70 
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-all duration-300 hover:border-[#C9A227]/70
                           autofill:shadow-[inset_0_0_0px_1000px_rgb(78,52,46)] autofill:[-webkit-text-fill-color:#FDF6EC]
                           ${validationError ? 'border-red-500/80 bg-red-500/10' : 'border-[#6D4C41] focus:border-[#C9A227]'}`}
              />

              {/* EMAIL INPUT */}
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                required
                disabled={loading}
                maxLength={128}
                autoComplete="email"
                spellCheck="false"
                autoCorrect="off"
                aria-invalid={!!validationError}
                className={`w-full p-2.5 sm:p-3 bg-[#4E342E]/60 backdrop-blur-sm border rounded-xl 
                           focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 
                           text-lg text-[#FDF6EC] placeholder-[#D7CCC8]/70 
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-all duration-300 hover:border-[#C9A227]/70
                           autofill:shadow-[inset_0_0_0px_1000px_rgb(78,52,46)] autofill:[-webkit-text-fill-color:#FDF6EC]
                           ${validationError ? 'border-red-500/80 bg-red-500/10' : 'border-[#6D4C41] focus:border-[#C9A227]'}`}
              />

              {/*PASSWORD INPUT */}
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
                disabled={loading}
                maxLength={8}  
                autoComplete="new-password"
                spellCheck="false"
                inputMode="text"
                aria-invalid={!!validationError}
                className={`w-full p-2.5 sm:p-3 bg-[#4E342E]/60 backdrop-blur-sm border rounded-xl 
                           focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 
                           text-lg text-[#FDF6EC] placeholder-[#D7CCC8]/70 
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-all duration-300 hover:border-[#C9A227]/70
                           ${validationError ? 'border-red-500/80 bg-red-500/10' : 'border-[#6D4C41] focus:border-[#C9A227]'}`}
              />

              {/* Signup Button */}
              <button
                type="submit"
                disabled={loading}
                className="group w-full py-2.5 sm:py-3 bg-gradient-to-r from-[#C9A227] to-[#B8941F] text-[#1C1C1C] 
                           text-lg font-bold rounded-full transition-all duration-300 
                           shadow-lg shadow-[#C9A227]/40 hover:shadow-xl hover:shadow-[#C9A227]/50 
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg
                           transform hover:scale-[1.02] active:scale-[0.98]
                           flex items-center justify-center gap-2 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FDF6EC]/25 to-transparent 
                               transform -skew-x-12 -translate-x-full group-hover:translate-x-full 
                               transition-transform duration-1000"></div>

                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#1C1C1C]"></div>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  "Begin Your Journey"
                )}
              </button>
            </form>

            {/* Navigation Options */}
            <div className="text-center mt-3 sm:mt-4">
              <p className="text-lg sm:text-lg text-[#D7CCC8]">
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
          <div className="text-center mt-3 sm:mt-4">
            <button
              onClick={() => navigate("/")}
              className="text-[#D7CCC8]/70 hover:text-[#C9A227] text-lg sm:text-lg transition-colors duration-300 
                       flex items-center gap-2 mx-auto"
            >
              <span>←</span> Return to Home
            </button>
          </div>
        </div>
      </div>

      {/* Global Styles */}
      <style>{`
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

export default Signup;
