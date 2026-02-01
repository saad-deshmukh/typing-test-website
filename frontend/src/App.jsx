import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/authContext";
import LandingPage from "./components/LandingPage";
import './index.css';
import Game from "./components/Game";
import Login from "./components/auth/Login.jsx";
import Signup from "./components/auth/SignUp.jsx";
import MultiplayerGame from "./components/Multiplayer.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import ResultsPage from "./components/ResultsPage.jsx";
import Profile from "./components/Profile.jsx";
import Leaderboard from "./components/LeaderBoard.jsx";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>

          <Route path="/" element={<LandingPage />} />
          <Route path="/game" element={<Game />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route
            path="/multiplayer"
            element={<ProtectedRoute><MultiplayerGame /></ProtectedRoute>}
          />

          <Route
            path="/results/:roomToken"
            element={<ProtectedRoute><ResultsPage /></ProtectedRoute>}
          />

          <Route
            path="/profile"
            element={<ProtectedRoute><Profile /></ProtectedRoute>}
          />


          <Route
            path="/leaderboard"
            element={<Leaderboard />}
          />

          <Route path="*" element={<div className="text-black text-center ">404: Page Not Found</div>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
