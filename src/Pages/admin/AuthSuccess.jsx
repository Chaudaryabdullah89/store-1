import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { toast } from 'react-toastify';
import api from '../../utils/axios';

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const handleAuthSuccess = async () => {
      try {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (error) {
          toast.error('Authentication failed. Please try again.');
          navigate('/login');
          return;
        }

        if (!token) {
          toast.error('No authentication token found.');
          navigate('/login');
          return;
        }

        // Store the token
        localStorage.setItem('token', token);

        // Get user data using the token
        const response = await api.get('/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.data) {
          throw new Error('Failed to fetch user data');
        }

        const userData = response.data;
        
        // Store user data
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Update auth context
        login(userData);

        toast.success('Successfully logged in!');
        navigate('/');
      } catch (error) {
        console.error('Auth success error:', error);
        toast.error('Failed to complete authentication. Please try again.');
        navigate('/login');
      }
    };

    handleAuthSuccess();
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Completing Authentication
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please wait while we complete your login...
          </p>
        </div>
        <div className="mt-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    </div>
  );
};

export default AuthSuccess; 