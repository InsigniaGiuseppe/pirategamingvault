
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
    <div className="min-h-screen flex flex-col bg-netflix-background">
      <Navigation />
      
      <main className="flex-grow">
        <div className="relative overflow-hidden">
          <div className="h-[50vh] bg-[url('https://picsum.photos/seed/piratehero/1920/1080')] bg-cover bg-center relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-netflix-background"></div>
            
            <div className="absolute bottom-0 left-0 p-6 md:p-12">
              <h1 className="text-4xl md:text-6xl font-bold text-white text-stroke mb-2">
                Pirate Gaming Vault
              </h1>
              <p className="text-xl text-white text-stroke mb-6 max-w-md">
                Hoist the mainsail and dive into our collection of treasured adventures!
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
