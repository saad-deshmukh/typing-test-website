import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';

/**
 * A wrapper component that protects routes meant only for authenticated users.
 * If a user is logged in, it renders the requested component.
 * If not, it redirects the user to the /login page.
 */
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    // User is not authenticated, redirect to the login page
    return <Navigate to="/login" />;
  }

  // User is authenticated, render the child components
  return children;
};

export default ProtectedRoute;
