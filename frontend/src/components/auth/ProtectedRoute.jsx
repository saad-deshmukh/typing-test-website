import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/authContext';

const ProtectedRoute = ({ children }) => {

  const { user, loading } = useAuth();
  const location = useLocation();

  // loading screen if auth is loading
  if (loading) {
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
          
          {/* Animated Sunlight Beam */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/2 w-1 h-full bg-gradient-to-b from-[#C9A227]/15 via-transparent to-transparent transform rotate-3 animate-pulse"></div>
          </div>

          {/* Floating Dust Particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-[#D7CCC8]/30 rounded-full animate-float"
                style={{
                  left: `${30 + i * 20}%`,
                  top: `${20 + i * 15}%`,
                  animationDelay: `${i * 2}s`,
                  animationDuration: `${6 + i}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* Loading Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="bg-[#FDF6EC]/10 backdrop-blur-xl border-2 border-[#C9A227]/30 rounded-2xl p-8 shadow-2xl shadow-[#4E342E]/50 relative">
              {/* Decorative Brass Corners */}
              <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-[#C9A227] rounded-tl-lg"></div>
              <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-[#C9A227] rounded-tr-lg"></div>
              <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-[#C9A227] rounded-bl-lg"></div>
              <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-[#C9A227] rounded-br-lg"></div>

              {/* Vintage Brass Spinner */}
              <div className="relative mb-6">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#6D4C41] border-t-[#C9A227] mx-auto shadow-lg shadow-[#C9A227]/20"></div>
                {/* Inner glow effect */}
                <div className="absolute inset-0 rounded-full bg-[#C9A227]/10 animate-pulse"></div>
              </div>

              {/* Loading Text */}
              <h3 className="font-heading text-xl font-semibold text-[#FDF6EC] mb-2">
                Verifying Access
              </h3>
              <p className="text-[#D7CCC8] text-sm">
                Checking your credentials...
              </p>

              {/* Subtle progress indicator */}
              <div className="mt-4 w-32 h-1 bg-[#4E342E] rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#C9A227] to-[#B8941F] rounded-full animate-pulse"></div>
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
              transform: translateY(-12px) translateX(6px);
              opacity: 0.7;
            }
          }
          
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  //  After loading, if no user, redirect to login.
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the children component
  return children;
};

export default ProtectedRoute;