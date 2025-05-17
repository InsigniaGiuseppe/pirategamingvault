
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileQuestion, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-saas-lavender-gradient overflow-hidden relative">
      <div className="absolute inset-0 bg-saas-lavender-dual-gradient"></div>
      
      <div className="text-center z-10 bg-white rounded-xl shadow-saas p-10 max-w-md">
        <div className="bg-saas-teal/10 rounded-full p-5 w-24 h-24 flex items-center justify-center mx-auto mb-8">
          <FileQuestion className="h-12 w-12 text-saas-teal" />
        </div>
        <h1 className="text-6xl font-bold text-saas-text-headline mb-4 font-heading">404</h1>
        <p className="text-2xl text-saas-text-body mb-8 font-heading">Resource not found.</p>
        <Link to="/">
          <Button className="bg-saas-teal text-white px-8 py-6 rounded-md flex items-center gap-2 shadow-saas-primary hover:shadow-saas-hover">
            <ArrowLeft size={18} />
            Return to Main Interface
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
