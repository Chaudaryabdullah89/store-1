import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, token, loading, isAdmin } = useAuth();

  console.log('ProtectedRoute state:', { 
    hasUser: !!user, 
    hasToken: !!token, 
    loading, 
    requireAdmin,
    isAdmin: isAdmin()
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || !token) {
    console.log('No user or token found, redirecting to login');
    return <Navigate to="/login" />;
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