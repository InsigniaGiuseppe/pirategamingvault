
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Skull } from 'lucide-react';
import { DoorOpen } from 'lucide-react';

const Navigation = () => {
  const { isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <nav className="bg-netflix-background border-b border-netflix-red/30 sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skull className="text-white h-8 w-8" />
          <span className="text-netflix-red font-bold text-xl bg-gradient-to-r from-netflix-red to-netflix-red/90 text-transparent bg-clip-text">PirateGaming</span>
        </div>
        
        <Button 
          variant="ghost" 
          className="text-white hover:text-netflix-red bg-netflix-red/20 hover:bg-netflix-red/30 backdrop-blur-sm"
          onClick={logout}
        >
          <DoorOpen className="mr-2 h-4 w-4" />
          Abandon Ship
        </Button>
      </div>
    </nav>
  );
};

export default Navigation;
