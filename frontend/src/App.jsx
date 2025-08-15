import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/authContext";
import LandingPage from "./components/LandingPage";
import './index.css';
import Game from "./components/Game";
import Login from "./components/Auth/Login.jsx";
import Signup from "./components/Auth/SignUp.jsx";
import MultiplayerGame from "./components/Multiplayer.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx"; // <-- 1. Import ProtectedRoute

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/game" element={<Game />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Route for Multiplayer */}
          <Route 
            path="/multiplayer" 
            element={
              <ProtectedRoute> {/* <-- 2. Wrap the component */}
                <MultiplayerGame />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
