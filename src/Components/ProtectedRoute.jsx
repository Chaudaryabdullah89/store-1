import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';

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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user || !token) {
    console.log('No user or token found, redirecting to login');
    // Redirect to admin login for admin routes
    if (requireAdmin) {
      return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
    }
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (requireAdmin && !isAdmin()) {
    console.log('Admin access required, redirecting to home');
    toast.error('Access denied. Admin privileges required.');
    return <Navigate to="/" replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requireAdmin: PropTypes.bool
};

export default ProtectedRoute; 