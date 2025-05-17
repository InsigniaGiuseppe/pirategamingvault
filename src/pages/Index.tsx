import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '@/components/LoginForm';
import { useAuth } from '@/hooks/useAuth';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Compass } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

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
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(() => {
    const attempts = sessionStorage.getItem('loginAttempts');
    return attempts ? parseInt(attempts) : 0;
  });
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
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

  useEffect(() => {
    sessionStorage.setItem('loginAttempts', loginAttempts.toString());
  }, [loginAttempts]);
  
  const handleLogin = (email: string, password: string) => {
    setLoginEmail(email);
    setLoginPassword(password);
    setLoading(true);
    setProgress(0);
    setIsPaused(false);
    setShowDialog(false);
    
    // Message rotation logic
    const messageInterval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 400);
    messageIntervalRef.current = messageInterval as unknown as number;
    
    // Progress bar logic
    const startTime = Date.now();
    const duration = 8000; // 8 seconds total
    
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(100, (elapsed / duration) * 100);
      
      if (newProgress >= 60 && !isPaused) {
        clearInterval(progressInterval);
        setIsPaused(true);
        setProgress(60);
        setShowDialog(true);
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
      setShowDialog(false);
      
      const startTime = Date.now();
      const remainingDuration = 8000 * ((100 - progress) / 100); // Calculate remaining time
      
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
          login(loginEmail, loginPassword);
          setLoading(false);
        }
      }, 50);
      progressIntervalRef.current = progressInterval as unknown as number;
    }
  };

  const cancelLogin = () => {
    setLoginAttempts(prev => prev + 1);
    
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    
    if (messageIntervalRef.current) {
      clearInterval(messageIntervalRef.current);
      messageIntervalRef.current = null;
    }
    
    setLoading(false);
    setIsPaused(false);
    setShowDialog(false);
    
    toast({
      title: "Journey aborted",
      description: "Returning to safe harbor...",
      variant: "default",
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-pirate-background bg-[url('/lovable-uploads/69fae18f-9c67-48fd-8006-c6181610037b.png')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/50 bg-canvas-grain"></div>
      
      {loading ? (
        <div className="fixed inset-0 bg-pirate-background/90 flex flex-col items-center justify-center z-50">
          <img src="/lovable-uploads/e06f6ebd-0d3f-461d-a92e-227b074e5c3c.png" alt="Pirate Logo" className="h-20 mb-6 animate-pulse" />
          
          {!showDialog && (
            <h2 className="text-pirate-text text-xl mb-6 font-cinzel">{loadingMessages[messageIndex]}</h2>
          )}
          
          <div className="w-64 mb-4">
            <Progress value={progress} className="h-2 bg-pirate-secondary" />
          </div>

          <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
            <AlertDialogContent className="parchment">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-pirate-secondary text-xl flex items-center justify-center gap-2 mb-2">
                  <Compass className="text-pirate-action h-6 w-6" />
                  <span>We've hit the doldrums!</span>
                </AlertDialogTitle>
                <AlertDialogDescription className="text-black font-medium text-base">
                  What shall we do, matey?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-4 flex flex-col sm:flex-row gap-3">
                <AlertDialogCancel 
                  onClick={cancelLogin}
                  className="border-pirate-accent text-pirate-secondary hover:bg-pirate-accent/10 font-medium order-2 sm:order-1"
                  disabled={loginAttempts >= 3}
                >
                  GO BACK TO LOGIN
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={resumeLoading}
                  className="bg-pirate-action text-white border-pirate-accent hover:bg-pirate-action/80 font-medium order-1 sm:order-2"
                >
                  CONTINUE
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {loginAttempts >= 3 && showDialog && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="parchment p-6 max-w-md text-center">
                <h3 className="text-xl font-cinzel text-pirate-secondary mb-3">Persistent squalls detected!</h3>
                <p className="text-black font-medium mb-4">
                  Please hail Pirate Gaming Support for assistance!
                </p>
                <button 
                  onClick={resumeLoading} 
                  className="mt-2 px-4 py-2 bg-pirate-action text-white border border-pirate-accent rounded shadow-pirate hover:bg-pirate-action/80 font-medium"
                >
                  CONTINUE ANYWAY
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="relative z-10 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-8">
            <img src="/lovable-uploads/e06f6ebd-0d3f-461d-a92e-227b074e5c3c.png" alt="Pirate Logo" className="h-[42px]" />
            <h1 className="text-pirate-accent font-bold text-4xl font-cinzel">PirateGaming</h1>
          </div>
          
          <LoginForm onLogin={handleLogin} />
        </div>
      )}
    </div>
  );
};

export default Index;
