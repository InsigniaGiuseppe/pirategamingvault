
import { useAuth } from '@/hooks/useAuth';

const Footer = () => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return null;
  
  return (
    <footer className="bg-pirate-background border-t border-pirate-accent/30 py-4 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p className="text-xs text-pirate-text/50">
          No DRM was harmed in the making of this joke.
        </p>
        <p className="text-xs text-pirate-text/40 mt-1">
          © {new Date().getFullYear()} Pirate Gaming Guild • The Seven Seas
        </p>
      </div>
    </footer>
  );
};

export default Footer;
