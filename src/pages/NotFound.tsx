
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-space-gradient overflow-hidden relative">
      <div className="absolute inset-0 animated-gradient opacity-10"></div>
      <div className="absolute inset-0 backdrop-blur-sm"></div>
      
      <div className="text-center z-10 glass-panel p-8 max-w-md">
        <div className="bg-digital-primary/10 rounded-full p-4 w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <FileQuestion className="h-12 w-12 text-digital-primary" />
        </div>
        <h1 className="text-6xl font-bold text-digital-primary mb-4 font-space glow-text">404</h1>
        <p className="text-2xl text-digital-text mb-8 font-space">File not found in the system.</p>
        <Link to="/">
          <Button className="primary-button text-black px-8 py-6 rounded-md">
            Return to Main Interface
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
