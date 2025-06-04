
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SimpleLoginForm from '@/components/SimpleLoginForm';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import Footer from '@/components/Footer';

const Index = () => {
  const { isAuthenticated, isLoading } = useSimpleAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard immediately
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      console.log('User authenticated, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, isLoading]);

  // Show minimal loading while auth is being checked (should be instant now)
  if (isLoading) {
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
          <SimpleLoginForm />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Index;
