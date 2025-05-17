
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
    <nav className="bg-saas-navy border-b border-saas-grey-800/30 sticky top-0 z-50 shadow-saas">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/dashboard" className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/e06f6ebd-0d3f-461d-a92e-227b074e5c3c.png" 
              alt="Pirate Gaming Logo" 
              className="h-[42px]" 
            />
            <div className="flex flex-col items-start">
              <span className="text-saas-teal font-bold text-xl font-heading">PIRATE GAMING</span>
              <span className="text-saas-grey-400 text-xs -mt-1">VAULT</span>
            </div>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          <div className="relative group">
            <button className="flex items-center gap-1 text-saas-white hover:text-saas-teal transition-colors py-2">
              Products <ChevronDown size={16} className="ml-1 text-saas-grey-400" />
            </button>
            <div className="absolute top-full left-0 bg-white rounded-md shadow-saas p-4 min-w-[280px] hidden group-hover:block animate-fade-in">
              <div className="grid grid-cols-1 gap-2">
                <a href="#" className="p-2 hover:bg-saas-grey-100 rounded flex items-start gap-3">
                  <div className="bg-saas-teal/10 p-2 rounded">
                    <Settings size={18} className="text-saas-teal" />
                  </div>
                  <div>
                    <p className="font-medium text-saas-navy">Game Library</p>
                    <p className="text-sm text-saas-grey-600">Access your entire collection</p>
                  </div>
                </a>
                <a href="#" className="p-2 hover:bg-saas-grey-100 rounded flex items-start gap-3">
                  <div className="bg-saas-pink/10 p-2 rounded">
                    <User size={18} className="text-saas-pink" />
                  </div>
                  <div>
                    <p className="font-medium text-saas-navy">Profile Manager</p>
                    <p className="text-sm text-saas-grey-600">Customize your gaming identity</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
          
          <div className="relative group">
            <button className="flex items-center gap-1 text-saas-white hover:text-saas-teal transition-colors py-2">
              Resources <ChevronDown size={16} className="ml-1 text-saas-grey-400" />
            </button>
            <div className="absolute top-full left-0 bg-white rounded-md shadow-saas p-4 min-w-[280px] hidden group-hover:block animate-fade-in">
              <div className="grid grid-cols-1 gap-2">
                <a href="#" className="p-2 hover:bg-saas-grey-100 rounded flex items-start gap-3">
                  <div className="bg-saas-teal/10 p-2 rounded">
                    <HelpCircle size={18} className="text-saas-teal" />
                  </div>
                  <div>
                    <p className="font-medium text-saas-navy">Support Center</p>
                    <p className="text-sm text-saas-grey-600">Get help with your account</p>
                  </div>
                </a>
                <a href="https://discord.gg/cZ7MfkNH" className="p-2 hover:bg-saas-grey-100 rounded flex items-start gap-3">
                  <div className="bg-saas-pink/10 p-2 rounded">
                    <User size={18} className="text-saas-pink" />
                  </div>
                  <div>
                    <p className="font-medium text-saas-navy">Community</p>
                    <p className="text-sm text-saas-grey-600">Join our Discord server</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            className="text-saas-white hover:text-saas-pink bg-saas-pink/10 hover:bg-saas-pink/20 border border-saas-pink/30"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
          
          {/* Mobile menu button */}
          <Button 
            variant="ghost" 
            className="lg:hidden bg-saas-teal/10 text-saas-teal hover:bg-saas-teal/20 border border-saas-teal/30"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-saas-navy border-t border-saas-grey-800/30 animate-fade-in">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <div className="border-b border-saas-grey-800/30 pb-3">
              <p className="text-saas-grey-400 text-sm mb-2">Products</p>
              <a href="#" className="block py-2 text-saas-white hover:text-saas-teal">Game Library</a>
              <a href="#" className="block py-2 text-saas-white hover:text-saas-teal">Profile Manager</a>
            </div>
            <div>
              <p className="text-saas-grey-400 text-sm mb-2">Resources</p>
              <a href="#" className="block py-2 text-saas-white hover:text-saas-teal">Support Center</a>
              <a href="https://discord.gg/cZ7MfkNH" className="block py-2 text-saas-white hover:text-saas-teal">Community</a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
