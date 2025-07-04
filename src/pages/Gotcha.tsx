
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ExternalLink, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const Gotcha = () => {
  const { isAuthenticated } = useSimpleAuth();
  const navigate = useNavigate();
  const [showImage, setShowImage] = useState(false);
  const [showChatBubble, setShowChatBubble] = useState(false);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    } else {
      // Delay showing the image for a more dramatic effect
      const timer = setTimeout(() => {
        setShowImage(true);
        
        // Add delay for chat bubble to appear after image animation completes
        const chatTimer = setTimeout(() => {
          setShowChatBubble(true);
          console.log("Chat bubble should be visible now");
        }, 1000); // Even shorter delay to make sure speech bubble appears quickly
        
        return () => clearTimeout(chatTimer);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, navigate]);
  
  if (!isAuthenticated) return null;
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 relative overflow-hidden">
      <div className="max-w-xl text-center z-10 bg-white p-8 rounded-xl shadow-saas relative">
        <div className="bg-gray-100 rounded-full p-5 w-24 h-24 flex items-center justify-center mx-auto mb-8">
          <AlertTriangle className="text-black h-12 w-12" />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-black mt-4 mb-6 font-heading">
          System Notice
        </h1>
        
        <p className="text-xl text-gray-600 mb-8">
          We don't actually pirate games. We're just a gaming guild with a sense of humor!
          Join our Discord if you like playing games legally.
        </p>
        
        <div className="space-y-4">
          <Button 
            className="bg-white text-black border-2 border-black w-full py-5 rounded-md flex items-center justify-center gap-2 hover:bg-black hover:text-white"
            onClick={() => navigate('/dashboard')}
          >
            <Home size={18} />
            Return to main interface
          </Button>
          
          <Button 
            variant="outline" 
            className="bg-white text-black border-2 border-black w-full py-5 rounded-md flex items-center justify-center gap-2 hover:bg-black hover:text-white"
            onClick={() => window.open('https://discord.gg/cZ7MfkNH', '_blank')}
          >
            <ExternalLink size={18} />
            Back to Discord
          </Button>
          
          <Button 
            variant="outline" 
            className="bg-white text-[#6441A4] border-2 border-gray-300 w-full py-5 rounded-md flex items-center justify-center gap-2 hover:bg-gray-100"
            onClick={() => window.open('https://www.twitch.tv/dannehtv/clip/JollyChillyTaroBibleThump-UZFqPcyh8uzVBiDA', '_blank')}
          >
            <ExternalLink size={18} />
            Meet the Pirate
          </Button>
        </div>
      </div>
      
      {showImage && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 50, 
            damping: 20, 
            mass: 1.2,
            duration: 1.2 
          }}
          className="absolute bottom-24 right-8 md:right-16 lg:right-24 z-20"
        >
          {showChatBubble && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="absolute -top-16 -left-40 md:-left-52 w-48 md:w-56 z-30"
            >
              <div className="bg-[#9b87f5] text-white p-3 rounded-xl rounded-br-none shadow-lg relative text-sm md:text-base">
                <p className="font-medium font-satoshi">
                  You should've subscribed, you dickhead!
                </p>
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#9b87f5] transform translate-x-1/2 translate-y-1/2 rotate-45"></div>
              </div>
            </motion.div>
          )}
          
          <div className="relative rounded-full overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105">
            <img 
              src="/lovable-uploads/10a05905-3893-4a2d-b626-9d976bb16378.png" 
              alt="Pirate Captain" 
              className="w-32 h-32 md:w-40 md:h-40 object-cover"
              style={{ 
                borderRadius: '50%',
                boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
              }}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Gotcha;
