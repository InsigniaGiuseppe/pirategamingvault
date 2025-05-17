
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ExternalLink, Home } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-saas-navy p-6 relative">
      <div className="absolute inset-0 bg-saas-gradient opacity-30"></div>
      
      <div className="max-w-xl text-center z-10 saas-panel-dark p-8">
        <div className="bg-saas-pink/10 rounded-full p-5 w-24 h-24 flex items-center justify-center mx-auto mb-8">
          <AlertTriangle className="text-saas-pink h-12 w-12" />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-saas-pink mt-4 mb-6 font-heading">
          System Notice
        </h1>
        
        <p className="text-xl text-saas-white mb-8">
          We don't actually pirate games. We're just a gaming guild with a sense of humor!
          Join our Discord if you like playing games legally.
        </p>
        
        <div className="space-y-4">
          <Button 
            className="saas-button-primary w-full py-5 rounded-md flex items-center justify-center gap-2"
            onClick={() => navigate('/dashboard')}
          >
            <Home size={18} />
            Return to Main Interface
          </Button>
          
          <Button 
            variant="outline" 
            className="saas-button-secondary w-full py-5 rounded-md flex items-center justify-center gap-2"
            onClick={() => window.open('https://discord.gg/cZ7MfkNH', '_blank')}
          >
            <ExternalLink size={18} />
            Join Our Discord
          </Button>
          
          <Button 
            variant="outline" 
            className="saas-button-outline w-full py-5 rounded-md flex items-center justify-center gap-2"
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
