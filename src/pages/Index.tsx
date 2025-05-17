
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '@/components/LoginForm';
import { useAuth } from '@/hooks/useAuth';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { AlertTriangle, Compass } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const loadingMessages = [
  "Initializing neural pathways…",
  "Calibrating quantum algorithms…",
  "Synchronizing neural networks…",
  "Processing cognitive matrices…",
  "Enhancing virtual reality…",
  "Optimizing digital synapses…",
  "Connecting parallel dimensions…"
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
      title: "Process terminated",
      description: "Returning to authentication portal...",
      variant: "default",
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-space-gradient bg-[url('/lovable-uploads/69fae18f-9c67-48fd-8006-c6181610037b.png')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
      <div className="absolute inset-0 animated-gradient opacity-10"></div>
      
      {loading ? (
        <div className="fixed inset-0 bg-digital-background/90 flex flex-col items-center justify-center z-50 backdrop-blur-md">
          <div className="relative">
            <img 
              src="/lovable-uploads/e06f6ebd-0d3f-461d-a92e-227b074e5c3c.png" 
              alt="Digital Gaming Logo" 
              className="h-20 mb-6 filter brightness-0 invert opacity-80"
              style={{ filter: 'brightness(0) invert(1) drop-shadow(0 0 10px rgba(39, 230, 247, 0.8))' }} 
            />
            <div className="absolute inset-0 animate-glow"></div>
          </div>
          
          {!showDialog && (
            <h2 className="text-digital-primary text-xl mb-6 font-space glow-text">{loadingMessages[messageIndex]}</h2>
          )}
          
          <div className="w-64 mb-4">
            <Progress value={progress} className="h-1.5 bg-digital-background border border-digital-primary/20" indicatorClassName="bg-digital-primary" />
          </div>

          <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
            <AlertDialogContent className="glass-panel border-digital-primary/20 max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-center text-2xl font-bold text-digital-primary flex items-center justify-center gap-3 mb-4">
                  <Compass className="text-digital-primary h-6 w-6" />
                  <span className="glow-text">System Anomaly Detected</span>
                </AlertDialogTitle>
                <AlertDialogDescription className="text-digital-text font-medium text-base text-center">
                  Neural pathway disrupted. How shall we proceed?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-6 flex flex-col sm:flex-row gap-3">
                <AlertDialogCancel 
                  onClick={cancelLogin}
                  className="border-digital-secondary text-digital-secondary hover:bg-digital-secondary/10 font-medium order-2 sm:order-1 secondary-button"
                  disabled={loginAttempts >= 3}
                >
                  RETURN TO LOGIN
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={resumeLoading}
                  className="bg-digital-primary text-black border-digital-primary/50 hover:bg-digital-primary/90 font-medium order-1 sm:order-2 shadow-digital-glow primary-button"
                >
                  CONTINUE
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {loginAttempts >= 3 && showDialog && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
              <div className="glass-panel p-6 max-w-md text-center">
                <AlertTriangle className="text-digital-secondary h-12 w-12 mx-auto mb-4" />
                <h3 className="text-xl font-space text-digital-secondary mb-3 glow-text-secondary">Continuous errors detected!</h3>
                <p className="text-digital-text font-medium mb-6">
                  Please hail Pirate Gaming Support on Discord for assistance.
                </p>
                <button 
                  onClick={resumeLoading} 
                  className="primary-button px-6 py-2.5 rounded-full font-medium"
                >
                  DISMISS
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="relative z-10 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-10">
            <img 
              src="/lovable-uploads/e06f6ebd-0d3f-461d-a92e-227b074e5c3c.png" 
              alt="Digital Gaming Logo" 
              className="h-12"
              style={{ filter: 'brightness(0) invert(1) drop-shadow(0 0 10px rgba(39, 230, 247, 0.8))' }} 
            />
            <h1 className="text-digital-primary font-bold text-4xl font-space glow-text">DIGITAL GAMING</h1>
          </div>
          
          <LoginForm onLogin={handleLogin} />
        </div>
      )}
    </div>
  );
};

export default Index;
