
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-netflix-background p-6">
      <div className="max-w-xl text-center">
        <Flag className="text-pirate-gold h-24 w-24 mx-auto animate-flag-wave" />
        
        <h1 className="text-4xl font-bold text-white mt-8 mb-6">
          All hands on deck!
        </h1>
        
        <p className="text-xl text-white mb-8">
          We don't actually pirate games. We're just a gaming guild with a sense of humor!
          Join our Discord if you like playing games legally.
        </p>
        
        <div className="space-y-4">
          <Button 
            className="bg-netflix-red hover:bg-netflix-red/80 text-white"
            onClick={() => navigate('/dashboard')}
          >
            Return to Home Port
          </Button>
          
          <Button variant="outline" className="text-white border-white/20">
            Join Our Discord
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Gotcha;
