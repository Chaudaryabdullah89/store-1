import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

// Create context with default values
const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        // Set initial state
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        
        // Verify token and get fresh user data
        try {
          const response = await api.get('/api/users/me');
          if (response.data) {
            // Update with fresh user data
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
          } else {2
            throw new Error('No user data received');
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          clearAuth();
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  const verifyToken = async (tokenToVerify) => {
    try {
      const response = await api.get('/api/users/me');
      if (response.data) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token verification failed:', error);
      clearAuth();
      return false;
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  const login = async (email, password) => {
    try {
      // Check if user is already logged in
      if (user && token) {
        console.log('User is already logged in');
        return true;
      }

      setLoading(true);
      setError(null);
      
      console.log('Attempting login for:', email);

      // Check if this is a Google login (password is actually the access token)
      if (password.length > 100) { // Google access tokens are typically longer
        console.log('Processing Google login');
        // For Google login, we already have the token and user data from the backend
        // Just need to set them in the context and localStorage
        setToken(password); // password is actually the token
        setUser(JSON.parse(localStorage.getItem('user')));
        api.defaults.headers.common['Authorization'] = `Bearer ${password}`;
        
        // Navigate based on user role
        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
        
        setLoading(false);
        return true;
      }

      // Regular login flow
      const response = await api.post('/api/auth/login', { email, password });
      console.log('Login response:', response.data);
      
      if (response.data.token) {
        const { token: newToken, user: userData } = response.data;
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        
        // Navigate based on user role
        if (userData.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
        
        setLoading(false);
        return true;
      }
      
      throw new Error('Invalid response from server');
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    console.log('Logging out user');
    clearAuth();
    navigate('/login');
  };

  const register = async (name, email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Attempting registration:', { name, email });
      
      const response = await api.post('/api/auth/register', { name, email, password });
      
      console.log('Registration response:', response.data);
      
      if (response.data.token) {
        const { token: newToken, ...userData } = response.data;
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        setLoading(false);
        return response.data;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setLoading(false);
      
      if (error.response) {
        const errorMessage = error.response.data.error || 'Registration failed';
        setError(errorMessage);
        throw new Error(errorMessage);
      } else {
        const errorMessage = 'Network error. Please try again.';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    }
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    logout,
    register,
    isAdmin
  };

  console.log('AuthContext: Provider value:', { 
    hasUser: !!user, 
    hasToken: !!token, 
    loading, 
    error,
    hasRegister: !!register 
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export { AuthContext };
export default AuthContext; 