
import { useAuth } from '@/hooks/useAuth';

const Footer = () => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return null;
  
  return (
    <footer className="bg-netflix-background border-t border-netflix-red/30 py-4 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p className="text-xs text-gray-500">
          No DRM was harmed in the making of this joke.
        </p>
        <p className="text-xs text-gray-600 mt-1">
          © {new Date().getFullYear()} Pirate Gaming Guild • The Seven Seas
        </p>
      </div>
    </footer>
  );
};

export default Footer;
