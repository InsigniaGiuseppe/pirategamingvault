
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Ship } from 'lucide-react';

const Navigation = () => {
  const { isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!isAuthenticated) return null;

  return (
    <nav className="bg-netflix-background border-b border-netflix-red/30 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Ship className="text-netflix-red h-8 w-8" />
          <span className="text-netflix-red font-bold text-xl">PirateGaming</span>
        </div>
        
        <div className="hidden md:flex items-center space-x-6 text-sm">
          <a href="/dashboard" className="text-gray-300 hover:text-white">Home Port</a>
          <a href="#" className="text-gray-300 hover:text-white">Treasure Maps</a>
          <a href="#" className="text-gray-300 hover:text-white">Crew Hideout</a>
          <a href="#" className="text-gray-300 hover:text-white">Plunder Achievements</a>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            className="text-white hover:text-netflix-red"
            onClick={logout}
          >
            Abandon Ship
          </Button>
          
          <Button 
            variant="outline" 
            className="md:hidden text-white border-white/20"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            Menu
          </Button>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="md:hidden bg-netflix-background border-t border-netflix-red/30 py-2">
          <div className="container mx-auto px-4 space-y-2">
            <a href="/dashboard" className="block text-gray-300 hover:text-white py-2">Home Port</a>
            <a href="#" className="block text-gray-300 hover:text-white py-2">Treasure Maps</a>
            <a href="#" className="block text-gray-300 hover:text-white py-2">Crew Hideout</a>
            <a href="#" className="block text-gray-300 hover:text-white py-2">Plunder Achievements</a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
