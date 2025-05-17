
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '@/components/LoginForm';
import { useAuth } from '@/hooks/useAuth';
import { Ship } from 'lucide-react';

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-netflix-background bg-[url('https://picsum.photos/seed/pirateships/1920/1080')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/70"></div>
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-8">
          <Ship className="text-netflix-red h-12 w-12" />
          <h1 className="text-netflix-red font-bold text-4xl">PirateGaming</h1>
        </div>
        
        <LoginForm />
      </div>
    </div>
  );
};

export default Index;
