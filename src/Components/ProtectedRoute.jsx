import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, token, loading, isAdmin } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute state:', { 
    hasUser: !!user, 
    hasToken: !!token, 
    loading, 
    requireAdmin,
    isAdmin: isAdmin(),
    path: location.pathname
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || !token) {
    console.log('No user or token found, redirecting to login');
    // Redirect to admin login for admin routes
    if (requireAdmin) {
      return <Navigate to="/admin/login" state={{ from: location.pathname }} />;
    }
    return <Navigate to="/login" state={{ from: location.pathname }} />;
  }

  if (requireAdmin && !isAdmin()) {
    console.log('Admin access required, redirecting to home');
    return <Navigate to="/" />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requireAdmin: PropTypes.bool
};

export default ProtectedRoute; 