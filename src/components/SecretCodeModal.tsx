
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { Lock, Shield, X } from 'lucide-react';

interface SecretCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameTitle: string;
}

const SecretCodeModal = ({ isOpen, onClose, gameTitle }: SecretCodeModalProps) => {
  const [code, setCode] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code === '010101!') {
      onClose();
      navigate('/gotcha');
    } else {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Invalid authentication sequence.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="saas-panel-dark border-saas-grey-800/30 text-saas-white max-w-md">
        <DialogHeader>
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 p-1 rounded-full bg-saas-grey-800/50 hover:bg-saas-grey-800/70 transition-colors"
          >
            <X size={16} className="text-saas-grey-400" />
          </button>
          <DialogTitle className="text-center text-2xl font-bold text-saas-teal font-heading flex flex-col items-center gap-3 pb-2">
            <Shield className="text-saas-teal h-8 w-8 mb-1" />
            RESTRICTED ACCESS
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center mb-6">
          <p className="text-saas-white text-lg">Enter authorization code for {gameTitle}</p>
          <p className="text-sm text-saas-grey-400 mt-2">(Obtain from our Discord server.)</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-saas-grey-400" />
            <Input 
              type="text" 
              value={code} 
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter authorization code"
              className="bg-saas-navy/40 border-saas-grey-800/30 text-saas-white pl-9 placeholder:text-saas-grey-400 focus:border-saas-teal focus:ring-saas-teal"
            />
          </div>
          
          <div className="flex flex-col space-y-3">
            <Button 
              type="submit" 
              className="saas-button-primary w-full py-5 text-saas-navy"
            >
              Authenticate Access
            </Button>
            
            <Button 
              type="button"
              onClick={onClose}
              className="saas-button-outline w-full py-3"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SecretCodeModal;
