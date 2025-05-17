
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '@/components/LoginForm';
import { useAuth } from '@/hooks/useAuth';
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
  const [isPaused, setIsPaused] = useState(false);
  const progressIntervalRef = useRef<number | null>(null);
  const messageIntervalRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, loading]);
  
  useEffect(() => {
    return () => {
      // Cleanup intervals on unmount
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (messageIntervalRef.current) {
        clearInterval(messageIntervalRef.current);
      }
    };
  }, []);
  
  const handleLogin = (email: string, password: string) => {
    setLoading(true);
    setProgress(0);
    setIsPaused(false);
    
    // Message rotation logic
    const messageInterval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 400);
    messageIntervalRef.current = messageInterval as unknown as number;
    
    // Progress bar logic
    const startTime = Date.now();
    const duration = 6000; // 6 seconds
    
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(100, (elapsed / duration) * 100);
      
      if (newProgress >= 60 && !isPaused) {
        clearInterval(progressInterval);
        setIsPaused(true);
        setProgress(60);
      } else if (!isPaused) {
        setProgress(newProgress);
        
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          clearInterval(messageInterval);
          progressIntervalRef.current = null;
          messageIntervalRef.current = null;
          login(email, password);
          setLoading(false);
        }
      }
    }, 50);
    progressIntervalRef.current = progressInterval as unknown as number;
  };
  
  const resumeLoading = () => {
    if (isPaused) {
      setIsPaused(false);
      
      const startTime = Date.now();
      const remainingDuration = 6000 * ((100 - progress) / 100); // Calculate remaining time
      
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const additionalProgress = Math.min(100 - progress, (elapsed / remainingDuration) * (100 - progress));
        const newProgress = progress + additionalProgress;
        
        setProgress(newProgress);
        
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          if (messageIntervalRef.current) {
            clearInterval(messageIntervalRef.current);
            messageIntervalRef.current = null;
          }
          progressIntervalRef.current = null;
          login("dummy", "dummy"); // Pass dummy values to login
          setLoading(false);
        }
      }, 50);
      progressIntervalRef.current = progressInterval as unknown as number;
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#03060a] bg-[url('/lovable-uploads/408372f3-3fa4-470e-a339-8ae385af8f01-profile_banner-480.jpeg')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/25 bg-[linear-gradient(45deg,rgba(0,0,0,.7)_25%,transparent_25%,transparent_50%,rgba(0,0,0,.7)_50%,rgba(0,0,0,.7)_75%,transparent_75%,transparent)] bg-[length:4px_4px]"></div>
      
      {loading ? (
        <div 
          className="fixed inset-0 bg-[#03060a]/90 flex flex-col items-center justify-center z-50 cursor-pointer"
          onClick={isPaused ? resumeLoading : undefined}
        >
          <img src="/lovable-uploads/e06f6ebd-0d3f-461d-a92e-227b074e5c3c.png" alt="Pirate Logo" className="h-20 mb-6 animate-pulse" />
          
          {isPaused ? (
            <h2 className="text-[#cde8e5] text-xl mb-6 text-center px-6">
              Oops, we're becalmed in the doldrums…<br />click to give the sails a push!
            </h2>
          ) : (
            <h2 className="text-[#cde8e5] text-xl mb-6">{loadingMessages[messageIndex]}</h2>
          )}
          
          <div className="w-64 mb-4">
            <Progress value={progress} className="h-2 bg-[#001f3f]" />
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
