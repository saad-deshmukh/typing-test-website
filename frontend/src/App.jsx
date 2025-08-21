import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/authContext";
import LandingPage from "./components/LandingPage";
import './index.css';
import Game from "./components/Game";
import Login from "./components/auth/Login.jsx";
import Signup from "./components/auth/SignUp.jsx";
import MultiplayerGame from "./components/Multiplayer.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import ResultsPage from "./components/ResultsPage.jsx"; // <-- 1. Import the new ResultsPage

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* ... (your existing public routes) */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/game" element={<Game />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route 
            path="/multiplayer" 
            element={<ProtectedRoute><MultiplayerGame /></ProtectedRoute>} 
          />
          
          {/* --- 2. ADD THIS NEW ROUTE --- */}
          <Route 
            path="/results/:roomToken" 
            element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} 
          />
          {/* ----------------------------- */}

        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;