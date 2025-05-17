
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Flag } from 'lucide-react';

const Gotcha = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  if (!isAuthenticated) return null;
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-pirate-background p-6 bg-canvas-grain">
      <div className="max-w-xl text-center">
        <Flag className="text-pirate-accent h-24 w-24 mx-auto animate-flag-wave" />
        
        <h1 className="text-4xl font-bold text-pirate-text mt-8 mb-6 font-cinzel">
          All hands on deck!
        </h1>
        
        <p className="text-xl text-pirate-text mb-8">
          We don't actually pirate games. We're just a gaming guild with a sense of humor!
          Join our Discord if you like playing games legally.
        </p>
        
        <div className="space-y-4">
          <Button 
            className="bg-pirate-action hover:bg-pirate-action/80 text-pirate-text w-full border border-pirate-accent shadow-pirate"
            onClick={() => navigate('/dashboard')}
          >
            Return to Home Port
          </Button>
          
          <Button 
            variant="outline" 
            className="text-pirate-text border-pirate-accent hover:bg-pirate-accent/10 w-full shadow-pirate"
            onClick={() => window.open('https://discord.gg/cZ7MfkNH', '_blank')}
          >
            Join Our Discord
          </Button>
          
          <Button 
            variant="outline" 
            className="text-pirate-text border-pirate-accent hover:bg-pirate-accent/10 w-full shadow-pirate"
            onClick={() => window.open('https://www.twitch.tv/dannehtv/clip/JollyChillyTaroBibleThump-UZFqPcyh8uzVBiDA', '_blank')}
          >
            Meet the Pirate
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Gotcha;
