
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-netflix-background overflow-hidden relative">
      <div className="parallax-cloud absolute animate-float opacity-20">
        <div className="h-32 w-32 rounded-full bg-white blur-xl -top-10 left-20"></div>
        <div className="h-24 w-48 rounded-full bg-white blur-xl top-40 left-60"></div>
        <div className="h-40 w-40 rounded-full bg-white blur-xl top-10 right-20"></div>
      </div>
      
      <div className="text-center z-10">
        <h1 className="text-6xl font-bold text-netflix-red mb-4">404</h1>
        <p className="text-2xl text-white mb-8">Here be no pages, matey.</p>
        <Link to="/">
          <Button className="bg-netflix-red hover:bg-netflix-red/80 text-white">
            Return to Home Port
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
