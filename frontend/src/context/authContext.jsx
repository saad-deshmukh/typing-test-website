import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// 1. Create the context
// This is the object that components will use to get auth data.
const AuthContext = createContext(null);

// 2. Create the provider component
// This component will wrap your app and manage the auth state.
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // This effect runs when the app first loads.
  // It checks if user data already exists in localStorage (from a previous session).
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []); // The empty array means this effect runs only once on mount.

  // The login function that will be called from your Login component.
  // It saves the user data to both localStorage and the React state.
  const login = (userData, token) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
    setUser(userData);
    navigate("/"); // Redirect to the homepage after a successful login.
  };

  // The logout function.
  // It clears the user data from localStorage and the React state.
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login"); // Redirect to the login page after logout.
  };

  // This is the value that will be available to all components
  // that are children of this provider.
  const value = { user, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Create a custom hook for easy access to the context
// This saves you from importing useContext and AuthContext in every component.
export const useAuth = () => {
  return useContext(AuthContext);
};
