
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Skull } from 'lucide-react';
import { DoorOpen } from 'lucide-react';

const Navigation = () => {
  const { isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <nav className="bg-[#0c1f2c] border-b border-[#cfb53b]/30 sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/lovable-uploads/e06f6ebd-0d3f-461d-a92e-227b074e5c3c.png" alt="Pirate Logo" className="h-[42px]" />
          <span className="text-[#8b0000] font-bold text-xl bg-gradient-to-r from-[#8b0000] to-[#8b0000]/90 text-transparent bg-clip-text">PirateGaming</span>
        </div>
        
        <Button 
          variant="ghost" 
          className="text-[#cde8e5] hover:text-[#8b0000] bg-[#8b0000]/20 hover:bg-[#8b0000]/30 backdrop-blur-sm shadow-lg"
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
