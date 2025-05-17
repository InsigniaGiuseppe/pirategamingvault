
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

const Footer = () => {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/e658c565-6755-4834-9495-f23f5cbac18c.png" 
              alt="Pirate Gaming Logo" 
              className="h-10"
              style={{ filter: 'brightness(0)' }}
            />
            <div>
              <h3 className="text-black font-bold text-lg">PIRATE GAMING</h3>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:flex gap-8 lg:gap-12">
            <div className="flex flex-col gap-2">
              <h4 className="text-black font-medium mb-2">EXPLORE</h4>
              <a href="#" className="text-gray-600 hover:text-black">Games</a>
              <a href="#" className="text-gray-600 hover:text-black">About Us</a>
              <a href="#" className="text-gray-600 hover:text-black">Community</a>
            </div>
            
            <div className="flex flex-col gap-2">
              <h4 className="text-black font-medium mb-2">SUPPORT</h4>
              <a href="#" className="text-gray-600 hover:text-black">FAQ</a>
              <a href="#" className="text-gray-600 hover:text-black">Terms</a>
              <a href="#" className="text-gray-600 hover:text-black">Privacy</a>
            </div>
            
            <div className="flex flex-col gap-2">
              <h4 className="text-black font-medium mb-2">CONNECT</h4>
              <a href="https://discord.gg/cZ7MfkNH" className="text-gray-600 hover:text-black">Discord</a>
              <Link to="/admin/login" className="text-gray-600 hover:text-black flex items-center gap-1">
                <Shield size={14} className="text-gray-600" />
                Admin
              </Link>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-gray-600 text-sm">
            © {year} Pirate Gaming. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
