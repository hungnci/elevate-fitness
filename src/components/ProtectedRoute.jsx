import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/**
 * A wrapper component for protected routes.
 * It checks if the user is authenticated. If authenticated, it renders the child routes (Outlet).
 * If not authenticated, it redirects the user to the login page.
 */
const ProtectedRoute = () => {
  const { user, loading } = useAuthStore();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
