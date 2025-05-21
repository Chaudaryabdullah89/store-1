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
      const response = await api.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      
      // Store auth data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set auth state
      setAuth({
        token,
        user,
        isAuthenticated: true,
        isLoading: false
      });

      // Handle navigation based on user role
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/');
      }

      return true;
    } catch (error) {
      console.error('Login error:', error);
      setAuth(prev => ({
        ...prev,
        isAuthenticated: false,
        isLoading: false
      }));
      throw error;
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