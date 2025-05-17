
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { DoorOpen } from 'lucide-react';

const Navigation = () => {
  const { isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <nav className="bg-pirate-background border-b border-pirate-accent/30 sticky top-0 z-50 shadow-pirate">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/lovable-uploads/e06f6ebd-0d3f-461d-a92e-227b074e5c3c.png" alt="Pirate Logo" className="h-[42px]" />
          <span className="text-pirate-accent font-bold text-xl font-cinzel">PirateGaming</span>
        </div>
        
        <Button 
          variant="ghost" 
          className="text-pirate-text hover:text-pirate-action bg-pirate-action/20 hover:bg-pirate-action/30 backdrop-blur-sm shadow-pirate border border-pirate-accent/40"
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
