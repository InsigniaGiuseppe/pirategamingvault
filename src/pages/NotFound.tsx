
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
    <div className="min-h-screen flex items-center justify-center bg-white overflow-hidden relative">
      <div className="text-center z-10 bg-white rounded-xl shadow-saas p-10 max-w-md">
        <div className="bg-gray-100 rounded-full p-5 w-24 h-24 flex items-center justify-center mx-auto mb-8">
          <FileQuestion className="h-12 w-12 text-black" />
        </div>
        <h1 className="text-6xl font-bold text-black mb-4 font-heading">404</h1>
        <p className="text-2xl text-gray-600 mb-8 font-heading">Resource not found</p>
        <Link to="/">
          <Button className="bg-white text-black border-2 border-black px-8 py-6 rounded-md flex items-center gap-2 hover:bg-black hover:text-white">
            <ArrowLeft size={18} />
            Return to main interface
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
