
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/sonner';
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
    <div className="min-h-screen flex flex-col bg-white">
      <Navigation />
      
      <main className="flex-grow">
        <div className="relative overflow-hidden">
          {/* Increased hero section height by 20% */}
          <div className="h-[20vh] relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white"></div>
            
            <img
              src="/lovable-uploads/69fae18f-9c67-48fd-8006-c6181610037b.png"
              className="absolute inset-0 w-full h-full object-cover opacity-10"
              alt="Hero background"
            />
            <div className="absolute inset-0 bg-white"></div>
            
            {/* Adjusted position of subtitle by reducing translate-y to avoid cutoff */}
            <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/3 p-4 md:p-8 animate-fade-up text-center">
              <div className="flex flex-col items-center">
                <h1 className="text-[2.5rem] md:text-clamp-hero font-bold text-black mb-2 font-satoshi">
                  Welcome to the PIRATE VAULT
                </h1>
                <p className="text-base md:text-xl text-gray-600 mb-4">
                  Access our private collection of digital adventures
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <GameGrid />
      </main>
      
      <Footer />
      <Toaster />
    </div>
  );
};

export default Dashboard;
