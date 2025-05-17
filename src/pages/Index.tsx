
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '@/components/LoginForm';
import { useAuth } from '@/hooks/useAuth';
import { Skull } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const loadingMessages = [
  "Charting new waters…",
  "Unfurling the mainsail…",
  "Polishing cutlasses…",
  "Counting dubloons…",
  "Bargaining with merfolk…",
  "Spotting land through the spyglass…",
  "Burying the X marks…"
];

const Index = () => {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, loading]);
  
  const handleLogin = (email: string, password: string) => {
    setLoading(true);
    
    // Message rotation logic
    const messageInterval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 400);
    
    // Progress bar logic
    const startTime = Date.now();
    const duration = 3000; // 3 seconds
    
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(100, (elapsed / duration) * 100);
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        clearInterval(progressInterval);
        clearInterval(messageInterval);
        login(email, password);
        setLoading(false);
      }
    }, 50);
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0c1f2c] bg-[url('/lovable-uploads/408372f3-3fa4-470e-a339-8ae385af8f01-profile_banner-480.jpeg')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/25 bg-[linear-gradient(45deg,rgba(0,0,0,.7)_25%,transparent_25%,transparent_50%,rgba(0,0,0,.7)_50%,rgba(0,0,0,.7)_75%,transparent_75%,transparent)] bg-[length:4px_4px]"></div>
      
      {loading ? (
        <div className="fixed inset-0 bg-[#0c1f2c]/90 flex flex-col items-center justify-center z-50">
          <img src="/lovable-uploads/e06f6ebd-0d3f-461d-a92e-227b074e5c3c.png" alt="Pirate Logo" className="h-20 mb-6 animate-pulse" />
          <h2 className="text-[#cde8e5] text-xl mb-6">{loadingMessages[messageIndex]}</h2>
          <div className="w-64 mb-4">
            <Progress value={progress} className="h-2 bg-[#3b2f2f]" />
          </div>
        </div>
      ) : (
        <div className="relative z-10 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-8">
            <img src="/lovable-uploads/e06f6ebd-0d3f-461d-a92e-227b074e5c3c.png" alt="Pirate Logo" className="h-[42px]" />
            <h1 className="text-[#8b0000] font-bold text-4xl bg-gradient-to-r from-[#8b0000] to-[#8b0000]/90 text-transparent bg-clip-text">PirateGaming</h1>
          </div>
          
          <LoginForm onLogin={handleLogin} />
        </div>
      )}
    </div>
  );
};

export default Index;
