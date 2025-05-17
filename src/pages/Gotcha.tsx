
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-saas-charcoal-gradient p-6 relative">
      <div className="absolute inset-0 bg-saas-gradient opacity-30"></div>
      
      <div className="max-w-xl text-center z-10 bg-white p-8 rounded-xl shadow-saas">
        <div className="bg-saas-sage/10 rounded-full p-5 w-24 h-24 flex items-center justify-center mx-auto mb-8">
          <AlertTriangle className="text-saas-sage h-12 w-12" />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-saas-text-headline mt-4 mb-6 font-heading">
          System Notice
        </h1>
        
        <p className="text-xl text-saas-text-body mb-8">
          We don't actually pirate games. We're just a gaming guild with a sense of humor!
          Join our Discord if you like playing games legally.
        </p>
        
        <div className="space-y-4">
          <Button 
            className="bg-saas-lavender text-white w-full py-5 rounded-md flex items-center justify-center gap-2 shadow-saas-primary hover:shadow-saas-hover"
            onClick={() => navigate('/dashboard')}
          >
            <Home size={18} />
            Return to main interface
          </Button>
          
          <Button 
            variant="secondary" 
            className="bg-saas-sage text-white w-full py-5 rounded-md flex items-center justify-center gap-2 shadow-saas-secondary hover:shadow-saas-hover"
            onClick={() => window.open('https://discord.gg/cZ7MfkNH', '_blank')}
          >
            <ExternalLink size={18} />
            Join our Discord
          </Button>
          
          <Button 
            variant="outline" 
            className="bg-transparent border border-saas-grey-300 text-saas-text-body w-full py-5 rounded-md flex items-center justify-center gap-2 hover:bg-saas-grey-100"
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
