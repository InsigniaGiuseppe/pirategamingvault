import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '@/components/LoginForm';
import { useAuth } from '@/hooks/useAuth';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { AlertTriangle, Compass, Ship } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ConfirmationModal from '@/components/ConfirmationModal';

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
  const [showConfirm, setShowConfirm] = useState(false);
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
    // First close the initial dialog and show confirmation
    setShowDialog(false);
    setShowConfirm(true);
  };

  const confirmResumeLoading = () => {
    if (isPaused) {
      setIsPaused(false);
      setShowConfirm(false);
      
      const startTime = Date.now();
      // Increase duration for the final 40% to make it slower, especially the last 10%
      const remainingDuration = 8000 * ((100 - progress) / 100); // Calculate remaining time
      
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        let additionalProgress;
        
        // Make the last 10% slower
        if (progress + additionalProgress >= 90) {
          additionalProgress = Math.min(100 - progress, (elapsed / (remainingDuration * 1.5)) * (100 - progress));
        } else {
          additionalProgress = Math.min(100 - progress, (elapsed / remainingDuration) * (100 - progress));
        }
        
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      {loading ? (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          {/* Ship sailing animation */}
          <div className="relative mb-8">
            <svg width="120" height="60" viewBox="0 0 120 60" className="sailing-ship">
              <path
                d="M10,40 Q30,35 60,40 Q90,45 110,40"
                stroke="#111111"
                strokeWidth="1"
                fill="none"
              />
              <path
                d="M60,20 L85,40 L35,40 Z"
                stroke="#111111"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M60,20 L60,5 L75,15 L60,20"
                stroke="#111111"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </div>
          
          {!showDialog && !showConfirm && (
            <h2 className="text-black text-xl mb-8 font-heading">{loadingMessages[messageIndex]}</h2>
          )}
          
          <div className="w-80 mb-6">
            <Progress value={progress} className="h-2 bg-gray-100" indicatorClassName="bg-black" />
          </div>

          <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
            <AlertDialogContent className="bg-white rounded-xl shadow-saas border-none max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-center text-2xl font-bold text-black flex items-center justify-center gap-3 mb-4 font-heading">
                  <Compass className="text-black h-6 w-6" />
                  System Anomaly Detected
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-600 font-medium text-base text-center">
                  We've hit the doldrums! What shall we do, matey?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-6 flex flex-col sm:flex-row gap-3">
                <AlertDialogCancel 
                  onClick={cancelLogin}
                  className="bg-white text-black border-2 border-black hover:bg-black hover:text-white order-2 sm:order-1"
                  disabled={loginAttempts >= 3}
                >
                  Return to sign-in
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={resumeLoading}
                  className="bg-white text-black border-2 border-black hover:bg-black hover:text-white order-1 sm:order-2"
                >
                  Continue loading
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <ConfirmationModal 
            isOpen={showConfirm}
            onConfirm={confirmResumeLoading}
            onCancel={cancelLogin}
          />

          {loginAttempts >= 3 && showDialog && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-md flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-saas p-8 max-w-md text-center">
                <AlertTriangle className="text-black h-12 w-12 mx-auto mb-4" />
                <h3 className="text-xl font-heading text-black mb-3">Continuous errors detected</h3>
                <p className="text-gray-600 font-medium mb-6">
                  Please contact Pirate Gaming Support on Discord for assistance.
                </p>
                <button 
                  onClick={resumeLoading} 
                  className="bg-white text-black border-2 border-black px-6 py-2.5 rounded-md font-medium hover:bg-black hover:text-white"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="relative z-10 flex flex-col items-center px-4 w-full max-w-md">
          <LoginForm onLogin={handleLogin} />
        </div>
      )}
    </div>
  );
};

export default Index;
