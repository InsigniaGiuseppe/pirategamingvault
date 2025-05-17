
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
  "Initializing user session…",
  "Authenticating credentials…",
  "Establishing secure connection…",
  "Loading user preferences…",
  "Preparing your vault…",
  "Syncing account data…",
  "Finalizing access protocols…"
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-saas-navy bg-[url('/lovable-uploads/69fae18f-9c67-48fd-8006-c6181610037b.png')] bg-cover bg-center">
      <div className="absolute inset-0 bg-saas-navy/90 backdrop-blur-sm"></div>
      
      {loading ? (
        <div className="fixed inset-0 bg-saas-navy/95 flex flex-col items-center justify-center z-50">
          <div className="relative mb-8">
            <img 
              src="/lovable-uploads/e06f6ebd-0d3f-461d-a92e-227b074e5c3c.png" 
              alt="Pirate Gaming Logo" 
              className="h-20"
              style={{ filter: 'brightness(0) invert(1) drop-shadow(0 0 10px rgba(39, 230, 247, 0.8))' }} 
            />
            <div className="absolute inset-0 animate-pulse"></div>
          </div>
          
          {!showDialog && (
            <h2 className="text-saas-teal text-xl mb-8 font-heading">{loadingMessages[messageIndex]}</h2>
          )}
          
          <div className="w-80 mb-6">
            <Progress value={progress} className="h-2 bg-saas-navy/50 border border-saas-teal/20" indicatorClassName="bg-saas-teal" />
          </div>

          <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
            <AlertDialogContent className="saas-panel-dark border-saas-grey-800/30 max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-center text-2xl font-bold text-saas-teal flex items-center justify-center gap-3 mb-4 font-heading">
                  <Compass className="text-saas-teal h-6 w-6" />
                  System Anomaly Detected
                </AlertDialogTitle>
                <AlertDialogDescription className="text-saas-white font-medium text-base text-center">
                  We've hit the doldrums! What shall we do, matey?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-6 flex flex-col sm:flex-row gap-3">
                <AlertDialogCancel 
                  onClick={cancelLogin}
                  className="saas-button-secondary order-2 sm:order-1"
                  disabled={loginAttempts >= 3}
                >
                  GO BACK TO LOGIN
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={resumeLoading}
                  className="saas-button-primary order-1 sm:order-2"
                >
                  CONTINUE
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {loginAttempts >= 3 && showDialog && (
            <div className="absolute inset-0 bg-saas-navy/95 backdrop-blur-md flex items-center justify-center z-50">
              <div className="saas-panel-dark p-8 max-w-md text-center">
                <AlertTriangle className="text-saas-pink h-12 w-12 mx-auto mb-4" />
                <h3 className="text-xl font-heading text-saas-pink mb-3">Continuous errors detected!</h3>
                <p className="text-saas-white font-medium mb-6">
                  Please hail Pirate Gaming Support on Discord for assistance.
                </p>
                <button 
                  onClick={resumeLoading} 
                  className="saas-button-primary px-6 py-2.5 rounded-md font-medium"
                >
                  DISMISS
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="relative z-10 flex flex-col items-center px-4 w-full max-w-md">
          <div className="flex flex-col items-center gap-3 mb-10">
            <img 
              src="/lovable-uploads/e06f6ebd-0d3f-461d-a92e-227b074e5c3c.png" 
              alt="Pirate Gaming Logo" 
              className="h-16"
              style={{ filter: 'brightness(0) invert(1) drop-shadow(0 0 5px rgba(39, 230, 247, 0.8))' }} 
            />
            <div className="text-center">
              <h1 className="text-saas-teal font-bold text-4xl md:text-5xl font-heading">PIRATE GAMING</h1>
              <p className="text-saas-grey-400 text-sm tracking-widest -mt-1">ENTERPRISE VAULT</p>
            </div>
          </div>
          
          <LoginForm onLogin={handleLogin} />
          
          <div className="mt-12 grid grid-cols-4 gap-8 max-w-lg">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-saas-grey-800/50 flex items-center justify-center">
                  <span className="text-saas-grey-500">C{i}</span>
                </div>
                <span className="text-saas-grey-500 text-xs mt-2">Client {i}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
