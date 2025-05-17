
import { useAuth } from '@/hooks/useAuth';

const Footer = () => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return null;
  
  return (
    <footer className="bg-saas-navy border-t border-saas-grey-800/20 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img 
                src="/lovable-uploads/e06f6ebd-0d3f-461d-a92e-227b074e5c3c.png" 
                alt="Pirate Gaming Logo" 
                className="h-[32px]" 
              />
              <div className="flex flex-col items-start">
                <span className="text-saas-teal font-bold text-sm font-heading">PIRATE GAMING</span>
                <span className="text-saas-grey-400 text-xs -mt-1">VAULT</span>
              </div>
            </div>
            <p className="text-saas-grey-400 text-sm">
              The most trusted enterprise gaming platform on the seven seas.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-saas-white font-medium mb-3 text-sm">Platform</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-saas-grey-400 text-sm hover:text-saas-teal">Features</a></li>
                <li><a href="#" className="text-saas-grey-400 text-sm hover:text-saas-teal">Pricing</a></li>
                <li><a href="#" className="text-saas-grey-400 text-sm hover:text-saas-teal">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-saas-white font-medium mb-3 text-sm">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-saas-grey-400 text-sm hover:text-saas-teal">About</a></li>
                <li><a href="https://discord.gg/cZ7MfkNH" className="text-saas-grey-400 text-sm hover:text-saas-teal">Discord</a></li>
                <li><a href="#" className="text-saas-grey-400 text-sm hover:text-saas-teal">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div>
            <h4 className="text-saas-white font-medium mb-3 text-sm">Legal</h4>
            <p className="text-saas-grey-400 text-sm">
              No DRM was harmed in the making of this joke.
            </p>
            <p className="text-saas-grey-500 text-sm mt-4">
              © {new Date().getFullYear()} Pirate Gaming Guild • All rights reserved
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
