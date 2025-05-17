
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

const Footer = () => {
  const year = new Date().getFullYear();
  
  return (
    <footer className="w-full bg-white border-t border-gray-200 py-4 mt-auto">
      <div className="w-full max-w-[1400px] mx-auto px-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/e658c565-6755-4834-9495-f23f5cbac18c.png" 
              alt="Pirate Gaming Logo" 
              className="h-8"
              style={{ filter: 'brightness(0)' }}
            />
            <div>
              <h3 className="text-black font-bold text-md">PIRATE GAMING</h3>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:flex gap-6">
            <div className="flex flex-col gap-1">
              <h4 className="text-black font-medium mb-1 text-sm">EXPLORE</h4>
              <a href="#" className="text-gray-600 hover:text-black text-xs">Games</a>
              <a href="#" className="text-gray-600 hover:text-black text-xs">About Us</a>
            </div>
            
            <div className="flex flex-col gap-1">
              <h4 className="text-black font-medium mb-1 text-sm">SUPPORT</h4>
              <a href="#" className="text-gray-600 hover:text-black text-xs">FAQ</a>
              <a href="#" className="text-gray-600 hover:text-black text-xs">Terms</a>
            </div>
            
            <div className="flex flex-col gap-1">
              <h4 className="text-black font-medium mb-1 text-sm">CONNECT</h4>
              <a href="https://discord.gg/cZ7MfkNH" className="text-gray-600 hover:text-black text-xs">Discord</a>
              <Link to="/admin/login" className="text-gray-600 hover:text-black text-xs">
                <Shield size={12} className="text-gray-600 inline mr-1" />
                Admin
              </Link>
            </div>
          </div>
        </div>
        
        <div className="mt-3 pt-2 border-t border-gray-200 flex justify-center">
          <p className="text-center text-gray-600 text-xs">
            © {year} Pirate Gaming. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
