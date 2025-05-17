
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 relative">
      <div className="max-w-xl text-center z-10 bg-white p-8 rounded-xl shadow-saas">
        <div className="bg-gray-100 rounded-full p-5 w-24 h-24 flex items-center justify-center mx-auto mb-8">
          <AlertTriangle className="text-black h-12 w-12" />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-black mt-4 mb-6 font-heading">
          System Notice
        </h1>
        
        <p className="text-xl text-gray-600 mb-8">
          We don't actually pirate games. We're just a gaming guild with a sense of humor!
          Join our Discord if you like playing games legally.
        </p>
        
        <div className="space-y-4">
          <Button 
            className="bg-white text-black border-2 border-black w-full py-5 rounded-md flex items-center justify-center gap-2 hover:bg-black hover:text-white"
            onClick={() => navigate('/dashboard')}
          >
            <Home size={18} />
            Return to main interface
          </Button>
          
          <Button 
            variant="outline" 
            className="bg-white text-black border-2 border-black w-full py-5 rounded-md flex items-center justify-center gap-2 hover:bg-black hover:text-white"
            onClick={() => window.open('https://discord.gg/cZ7MfkNH', '_blank')}
          >
            <ExternalLink size={18} />
            Back to Discord
          </Button>
          
          <Button 
            variant="outline" 
            className="bg-white text-[#8B5CF6] border-2 border-gray-300 w-full py-5 rounded-md flex items-center justify-center gap-2 hover:bg-gray-100"
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
