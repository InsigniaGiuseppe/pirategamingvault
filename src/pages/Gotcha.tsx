
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ExternalLink } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-space-gradient p-6 relative">
      <div className="absolute inset-0 animated-gradient opacity-20"></div>
      
      <div className="max-w-xl text-center z-10 glass-panel p-8">
        <div className="bg-digital-secondary/10 rounded-full p-4 w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="text-digital-secondary h-12 w-12" />
        </div>
        
        <h1 className="text-4xl font-bold text-digital-secondary mt-4 mb-6 font-space glow-text-secondary">
          System Notice
        </h1>
        
        <p className="text-xl text-digital-text mb-8">
          We don't actually pirate games. We're just a gaming guild with a sense of humor!
          Join our Discord if you like playing games legally.
        </p>
        
        <div className="space-y-4">
          <Button 
            className="primary-button text-black w-full py-5 rounded-md flex items-center justify-center gap-2"
            onClick={() => navigate('/dashboard')}
          >
            Return to Main Interface
          </Button>
          
          <Button 
            variant="outline" 
            className="secondary-button w-full py-5 rounded-md flex items-center justify-center gap-2"
            onClick={() => window.open('https://discord.gg/cZ7MfkNH', '_blank')}
          >
            <ExternalLink size={18} />
            Join Our Discord
          </Button>
          
          <Button 
            variant="outline" 
            className="secondary-button w-full py-5 rounded-md flex items-center justify-center gap-2"
            onClick={() => window.open('https://www.twitch.tv/dannehtv/clip/JollyChillyTaroBibleThump-UZFqPcyh8uzVBiDA', '_blank')}
          >
            <ExternalLink size={18} />
            Meet the Pirate
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Gotcha;
