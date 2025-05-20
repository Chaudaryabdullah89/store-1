import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from './axios';
import axios from 'axios';
import { useAuth } from '../Context/AuthContext';

// Create a separate axios instance for Google API calls
const googleApi = axios.create({
  baseURL: window.location.origin, // Use the current origin (e.g., http://localhost:5173)
  headers: {
    'Content-Type': 'application/json'
  }
});

export const GoogleAuthButton = ({ disabled }) => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const handleSuccess = async (response) => {
    try {
      console.log('Google login successful, response:', response);
      
      if (!response.access_token) {
        console.error('No access token in response:', response);
        throw new Error('No access token received from Google');
      }

      // Get user info from Google
      const userInfoResponse = await googleApi.get('/google-api/oauth2/v3/userinfo', {
        headers: { 
          Authorization: `Bearer ${response.access_token}`
        }
      });
        
      if (!userInfoResponse.data) {
        throw new Error('Failed to get user info from Google');
      }

      const userInfo = userInfoResponse.data;
      console.log('Google user info:', userInfo);

      // Send to backend
      const authResponse = await api.post('/auth/google', {
        access_token: response.access_token,
        user_info: userInfo
      });
        
      if (authResponse.data) {
        const { token, user } = authResponse.data;
        
        // Store user data in localStorage first
        localStorage.setItem('user', JSON.stringify(user));
        
        // Use the AuthContext login function to update the state
        await authLogin(user.email, token);
        
        // Show success message
        toast.success('Login successful!');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Google auth error:', error);
      
      let errorMessage = 'Google authentication failed. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    }
  };

  const handleError = (error) => {
    console.error('Google login error details:', {
      error,
      message: error?.message,
      response: error?.response,
      request: error?.request,
      config: error?.config,
      stack: error?.stack
    });
    toast.error('Google login failed. Please try again.');
  };

  const login = useGoogleLogin({
    onSuccess: handleSuccess,
    onError: handleError,
    flow: 'implicit',
    scope: 'email profile'
  });

  return (
    <button
      onClick={() => login()}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="currentColor"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="currentColor"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="currentColor"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      Continue with Google
    </button>
  );
};

export default GoogleAuthButton; 