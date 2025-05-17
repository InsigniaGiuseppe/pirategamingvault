
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Lock, Shield, X, Ship } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';
import ShipAnimation from './ShipAnimation';

interface SecretCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameTitle: string;
}

const SecretCodeModal = ({ isOpen, onClose, gameTitle }: SecretCodeModalProps) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [continuedLoading, setContinuedLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (loading) {
      timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 60 && !continuedLoading) {
            clearInterval(timer);
            return 60;
          }
          
          // Slow down progress for last 10%
          if (prev >= 90 && continuedLoading) {
            const increment = 0.5;
            const newProgress = prev + increment;
            
            if (newProgress >= 100) {
              clearInterval(timer);
              setTimeout(() => {
                if (code === '010101!') {
                  navigate('/gotcha');
                } else {
                  toast({
                    variant: "destructive",
                    title: "Access Denied",
                    description: "Invalid authentication sequence.",
                  });
                  setLoading(false);
                  setProgress(0);
                  setContinuedLoading(false);
                }
              }, 500);
              return 100;
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
    };
  }, [loading, continuedLoading, code, navigate, toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  };

  const handleContinueLoading = () => {
    setShowConfirm(true);
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
          
          <form onSubmit={handleSubmit} className="space-y-6">
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
            <p className="text-black text-lg mb-6">Validating authorization code...</p>
            
            <div className="relative mb-4">
              <Progress value={progress} className="h-2" />
              <ShipAnimation />
            </div>
            
            <p className="text-sm text-gray-600 mt-1">{progress.toFixed(0)}% Complete</p>
          </div>
          
          <div className="flex flex-col space-y-3">
            {progress >= 60 && !continuedLoading && (
              <Button 
                onClick={handleContinueLoading} 
                className="bg-white text-black border-2 border-black w-full py-5 hover:bg-black hover:text-white"
              >
                Continue Loading
              </Button>
            )}
            
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

      <ConfirmationModal 
        isOpen={showConfirm} 
        onConfirm={handleConfirmContinue}
        onCancel={handleCancelContinue}
      />
    </>
  );
};

export default SecretCodeModal;
