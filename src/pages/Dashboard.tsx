
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
    <div className="min-h-screen flex flex-col bg-pirate-background bg-canvas-grain">
      <Navigation />
      
      <main className="flex-grow">
        <div className="relative overflow-hidden">
          <div className="h-[50vh] relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-pirate-background"></div>
            
            <img
              src="/lovable-uploads/e252566e-bd30-4d27-af92-2381a541a2ea.png"
              className="absolute inset-0 w-full h-full object-cover opacity-50 blur-[2px]"
              alt="Hero background"
            />
            
            <div className="absolute bottom-0 left-0 p-6 md:p-12">
              <h1 className="text-4xl md:text-6xl font-bold text-pirate-text mb-2 shadow-lg font-cinzel">
                Pirate Gaming Vault
              </h1>
              <p className="text-xl text-pirate-text mb-6 max-w-md shadow-lg">
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
