
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
    <div className="min-h-screen flex flex-col bg-[#0c1f2c] bg-[linear-gradient(45deg,rgba(0,0,0,.7)_25%,transparent_25%,transparent_50%,rgba(0,0,0,.7)_50%,rgba(0,0,0,.7)_75%,transparent_75%,transparent)] bg-[length:4px_4px]">
      <Navigation />
      
      <main className="flex-grow">
        <div className="relative overflow-hidden">
          <div className="h-[50vh] relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0c1f2c]"></div>
            
            <iframe
              src="https://clips.twitch.tv/embed?clip=JollyChillyTaroBibleThump-UZFqPcyh8uzVBiDA&parent=localhost&autoplay=true&muted=true"
              className="absolute inset-0 w-full h-full object-cover opacity-50 blur-[2px]"
              allowFullScreen
              frameBorder="0"
              allow="autoplay; clipboard-write"
            ></iframe>
            
            <div className="absolute bottom-0 left-0 p-6 md:p-12">
              <h1 className="text-4xl md:text-6xl font-bold text-[#cde8e5] mb-2 shadow-lg">
                Pirate Gaming Vault
              </h1>
              <p className="text-xl text-[#cde8e5] mb-6 max-w-md shadow-lg">
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
