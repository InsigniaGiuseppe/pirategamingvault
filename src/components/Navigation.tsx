
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, User, Settings, HelpCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const Navigation = () => {
  const { isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!isAuthenticated) return null;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-saas">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/dashboard" className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/e06f6ebd-0d3f-461d-a92e-227b074e5c3c.png" 
              alt="Pirate Gaming Logo" 
              className="h-[42px]"
              style={{ filter: 'brightness(0)' }}
            />
            <div className="flex flex-col items-start">
              <span className="text-black font-bold text-xl font-heading">PIRATE GAMING</span>
              <span className="text-gray-500 text-xs -mt-1">VAULT</span>
            </div>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          <div className="relative group">
            <button className="flex items-center gap-1 text-black hover:text-gray-700 transition-colors py-2">
              Products <ChevronDown size={16} className="ml-1 text-gray-500" />
            </button>
            <div className="absolute top-full left-0 bg-white rounded-md shadow-saas p-4 min-w-[280px] hidden group-hover:block animate-fade-in">
              <div className="grid grid-cols-1 gap-2">
                <a href="#" className="p-2 hover:bg-gray-100 rounded flex items-start gap-3">
                  <div className="bg-gray-100 p-2 rounded">
                    <Settings size={18} className="text-black" />
                  </div>
                  <div>
                    <p className="font-medium text-black">Game Library</p>
                    <p className="text-sm text-gray-600">Access your entire collection</p>
                  </div>
                </a>
                <a href="#" className="p-2 hover:bg-gray-100 rounded flex items-start gap-3">
                  <div className="bg-gray-100 p-2 rounded">
                    <User size={18} className="text-black" />
                  </div>
                  <div>
                    <p className="font-medium text-black">Profile Manager</p>
                    <p className="text-sm text-gray-600">Customize your gaming identity</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
          
          <div className="relative group">
            <button className="flex items-center gap-1 text-black hover:text-gray-700 transition-colors py-2">
              Resources <ChevronDown size={16} className="ml-1 text-gray-500" />
            </button>
            <div className="absolute top-full left-0 bg-white rounded-md shadow-saas p-4 min-w-[280px] hidden group-hover:block animate-fade-in">
              <div className="grid grid-cols-1 gap-2">
                <a href="#" className="p-2 hover:bg-gray-100 rounded flex items-start gap-3">
                  <div className="bg-gray-100 p-2 rounded">
                    <HelpCircle size={18} className="text-black" />
                  </div>
                  <div>
                    <p className="font-medium text-black">Support Center</p>
                    <p className="text-sm text-gray-600">Get help with your account</p>
                  </div>
                </a>
                <a href="https://discord.gg/cZ7MfkNH" className="p-2 hover:bg-gray-100 rounded flex items-start gap-3">
                  <div className="bg-gray-100 p-2 rounded">
                    <User size={18} className="text-black" />
                  </div>
                  <div>
                    <p className="font-medium text-black">Community</p>
                    <p className="text-sm text-gray-600">Join our Discord server</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="text-black border-2 border-black hover:bg-black hover:text-white"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            SIGN OUT
          </Button>
          
          {/* Mobile menu button */}
          <Button 
            variant="outline" 
            className="lg:hidden border-2 border-black text-black hover:bg-black hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 animate-fade-in">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <div className="border-b border-gray-200 pb-3">
              <p className="text-gray-500 text-sm mb-2">Products</p>
              <a href="#" className="block py-2 text-black hover:text-gray-700">Game Library</a>
              <a href="#" className="block py-2 text-black hover:text-gray-700">Profile Manager</a>
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-2">Resources</p>
              <a href="#" className="block py-2 text-black hover:text-gray-700">Support Center</a>
              <a href="https://discord.gg/cZ7MfkNH" className="block py-2 text-black hover:text-gray-700">Community</a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
