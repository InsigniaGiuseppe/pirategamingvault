import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Lock, Shield, X, AlertTriangle } from 'lucide-react';
import { verifyAuthCode } from '@/services/credentialService';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';

interface SecretCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameTitle: string;
}

// Pirate-themed loading messages
const pirateLoadingMessages = [
  "Hoisting the main sail...",
  "Checking for stowaways...",
  "Polishing the cannon balls...",
  "Consulting the treasure map...",
  "Scanning the horizon for rivals...",
  "Feeding the captain's parrot...",
  "Swabbing the poop deck...",
  "Setting course for adventure..."
];

const SecretCodeModal = ({ isOpen, onClose, gameTitle }: SecretCodeModalProps) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [continuedLoading, setContinuedLoading] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useSimpleAuth();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let messageTimer: NodeJS.Timeout;
    
    if (loading) {
      // Rotate through pirate messages
      messageTimer = setInterval(() => {
        setMessageIndex(prev => (prev + 1) % pirateLoadingMessages.length);
      }, 1500);
      
      timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 60 && !continuedLoading) {
            clearInterval(timer);
            setShowConfirm(true);
            return 60;
          }
          
          // Slow down progress for last 10%
          if (prev >= 90 && continuedLoading) {
            const increment = 0.5;
            const newProgress = prev + increment;
            
            if (newProgress >= 99) {
              // Make the last 1% extremely slow
              const finalIncrement = 0.05; // Very slow increment for the last 1%
              const finalProgress = prev + finalIncrement;
              
              if (finalProgress >= 100) {
                clearInterval(timer);
                clearInterval(messageTimer);
                setTimeout(() => {
                  // Verify auth code against the user's credentials
                  const isValid = user ? verifyAuthCode(user, code) : code === '010101!';
                  
                  if (isValid) {
                    navigate('/gotcha');
                  } else {
                    toast({
                      variant: "destructive",
                      title: "Access Denied",
                      description: "Wrong code, landlubber! Walk the plank!"
                    });
                    setLoading(false);
                    setProgress(0);
                    setContinuedLoading(false);
                  }
                }, 500);
                return 100;
              }
              
              return finalProgress;
            }
            
            return newProgress;
          }
          
          // Normal progress speed
          const increment = continuedLoading ? 3 : 5;
          return Math.min(prev + increment, continuedLoading ? 90 : 60);
        });
      }, 200);
    }
    
    return () => {
      if (timer) clearInterval(timer);
      if (messageTimer) clearInterval(messageTimer);
    };
  }, [loading, continuedLoading, code, navigate, toast, user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  };

  const handleConfirmContinue = () => {
    setShowConfirm(false);
    setContinuedLoading(true);
  };

  const handleCancelContinue = () => {
    setShowConfirm(false);
    setLoading(false);
    setProgress(0);
  };

  const handleCancel = () => {
    setLoading(false);
    setProgress(0);
    setContinuedLoading(false);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen && !loading} onOpenChange={onClose}>
        <DialogContent className="bg-white rounded-xl shadow-saas border-none text-black max-w-md">
          <DialogHeader>
            <button 
              onClick={onClose}
              className="absolute right-4 top-4 p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <X size={16} className="text-black" />
            </button>
            <DialogTitle className="text-center text-2xl font-bold text-black font-heading flex flex-col items-center gap-3 pb-2">
              <Shield className="text-black h-8 w-8 mb-1" />
              Restricted Access
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-center mb-6">
            <p className="text-black text-lg">Enter authorization code for {gameTitle}</p>
            <p className="text-sm text-gray-600 mt-2">(Obtain from GIUSEPPE in the Discord Server.)</p>
          </div>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            setLoading(true);
          }} className="space-y-6">
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <Input 
                type="text" 
                value={code} 
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter authorization code"
                className="bg-white border-2 border-gray-300 text-black pl-9 placeholder:text-gray-400 focus:border-black focus:ring-black"
              />
            </div>
            
            <div className="flex flex-col space-y-3">
              <Button 
                type="submit" 
                className="bg-white text-black border-2 border-black w-full py-5 hover:bg-black hover:text-white"
              >
                Authenticate Access
              </Button>
              
              <Button 
                type="button"
                onClick={onClose}
                variant="outline"
                className="border-2 border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-black w-full py-3"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={loading && !showConfirm} onOpenChange={() => {}}>
        <DialogContent className="bg-white rounded-xl shadow-saas border-none text-black max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-black font-heading flex flex-col items-center gap-3 pb-2">
              <img 
                src="/lovable-uploads/e658c565-6755-4834-9495-f23f5cbac18c.png" 
                alt="Pirate Gaming Logo" 
                className="h-16 mb-2"
                style={{ filter: 'brightness(0)' }}
              />
              Authenticating Access
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-center mb-6">
            <p className="text-black text-lg mb-6">{pirateLoadingMessages[messageIndex]}</p>
            
            <div className="relative mb-4">
              <Progress value={progress} className="h-2" />
            </div>
            
            <p className="text-sm text-gray-600 mt-1">{progress.toFixed(0)}% Complete</p>
          </div>
          
          <div className="flex flex-col space-y-3">
            <Button 
              onClick={handleCancel}
              variant="outline"
              className="border-2 border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-black w-full py-3"
            >
              Return to Sign-in
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Updated confirmation modal with alert styling */}
      <Dialog open={showConfirm} onOpenChange={() => setShowConfirm(false)}>
        <DialogContent className="bg-white rounded-xl shadow-saas border-none text-black max-w-md">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-center text-2xl font-bold text-[#ea384c] flex items-center justify-center gap-3 mb-2 font-heading">
              <AlertTriangle className="h-8 w-8 text-[#ea384c]" />
              <span>System Anomaly Detected</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="border-2 border-[#ea384c]/30 bg-[#ea384c]/5 rounded-lg p-4 my-4">
            <p className="text-center text-black font-medium">
              We've hit the doldrums! What shall we do, matey?
            </p>
          </div>
          
          <div className="flex flex-col space-y-3">
            <Button
              onClick={handleConfirmContinue}
              className="bg-[#ea384c] hover:bg-[#ea384c]/80 text-white border-0 w-full py-3"
            >
              Continue loading
            </Button>
            
            <Button
              onClick={handleCancelContinue}
              variant="outline" 
              className="border-2 border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-black w-full py-3"
            >
              Return to sign-in
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SecretCodeModal;
