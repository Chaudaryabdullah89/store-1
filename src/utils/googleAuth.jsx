import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from './axios';
import axios from 'axios';
import { useAuth } from '../Context/AuthContext';

// Create a separate axios instance for Google API calls
const googleApi = axios.create({
  baseURL: 'https://www.googleapis.com', // Use Google's API base URL
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
      const userInfoResponse = await googleApi.get('/oauth2/v3/userinfo', {
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
      const authResponse = await api.post('/api/auth/google', {
        access_token: response.access_token,
        user_info: userInfo
      });
        
      if (authResponse.data) {
        const { token, user } = authResponse.data;
        
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(user));
        
        // Use the AuthContext login function to update the state
        await authLogin(user.email, token);
        
        // Show success message
        toast.success('Login successful!');
        
        // Navigate to home page
        navigate('/');
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
    console.error('Google login error:', error);
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
      className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
      Continue with Google
    </button>
  );
};

export default GoogleAuthButton; 