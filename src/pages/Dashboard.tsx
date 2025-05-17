
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';
import GameGrid from '@/components/GameGrid';
import Footer from '@/components/Footer';

const Dashboard = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  if (!isAuthenticated) return null;
  
  return (
    <div className="min-h-screen flex flex-col bg-saas-charcoal-gradient">
      <Navigation />
      
      <main className="flex-grow">
        <div className="relative overflow-hidden">
          {/* Reduced hero section height by 40% */}
          <div className="h-[30vh] relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white"></div>
            
            <img
              src="/lovable-uploads/69fae18f-9c67-48fd-8006-c6181610037b.png"
              className="absolute inset-0 w-full h-full object-cover opacity-30"
              alt="Hero background"
            />
            <div className="absolute inset-0 bg-saas-charcoal-gradient"></div>
            
            {/* Reduced header size by 40% */}
            <div className="absolute bottom-0 left-0 p-4 md:p-8 animate-fade-up">
              <h1 className="text-3xl md:text-4xl font-bold text-saas-text-headline mb-2 font-heading">
                PIRATE GAMING VAULT
              </h1>
              <p className="text-base text-saas-text-body mb-4 max-w-md">
                Access our private collection of digital adventures
              </p>
            </div>
          </div>
        </div>
        
        <GameGrid />
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
