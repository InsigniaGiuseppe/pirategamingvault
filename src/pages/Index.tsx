
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '@/components/LoginForm';
import { useAuth } from '@/hooks/useAuth';
import Footer from '@/components/Footer';

const Index = () => {
  const { isAuthenticated, isLoading: authLoading, login } = useAuth();
  const navigate = useNavigate();
  const [isProcessingLogin, setIsProcessingLogin] = useState(false);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      console.log('User authenticated, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, authLoading]);

  const handleLogin = async (username: string, password: string) => {
    // Prevent multiple login attempts
    if (isProcessingLogin || authLoading) {
      console.log('Login already in progress, ignoring request');
      return;
    }
    
    try {
      setIsProcessingLogin(true);
      console.log('Starting login process for:', username);
      await login(username, password);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsProcessingLogin(false);
    }
  };
  
  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-grow flex items-center justify-center px-4 py-10 w-full">
        <div className="relative z-10 flex flex-col items-center w-full max-w-md">
          <LoginForm onLogin={handleLogin} />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Index;
