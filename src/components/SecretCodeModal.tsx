
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
      <DialogContent className="glass-panel border-digital-primary/30 text-digital-text max-w-md bg-digital-panel">
        <DialogHeader>
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 p-1 rounded-full bg-digital-background/50 border border-digital-primary/20"
          >
            <X size={16} className="text-digital-muted" />
          </button>
          <DialogTitle className="text-center text-2xl font-bold text-digital-primary font-space flex flex-col items-center gap-2">
            <Shield className="text-digital-primary h-8 w-8 mb-1" />
            <span className="glow-text">RESTRICTED ACCESS</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center mb-4">
          <p className="text-digital-text">Enter authorization code for {gameTitle}</p>
          <p className="text-xs text-digital-muted mt-2">(Obtain from our Discord server.)</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-digital-muted" />
            <Input 
              type="text" 
              value={code} 
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter authorization code"
              className="bg-digital-background/40 border-digital-primary/20 text-digital-text pl-9 placeholder:text-digital-muted/70 focus:ring-digital-primary"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full primary-button py-5 text-black"
          >
            Authenticate Access
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SecretCodeModal;
