
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

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
        title: "Wrong code, landlubber!",
        description: "Walk the plank!",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-pirate-secondary border-pirate-accent border-2 text-pirate-text max-w-md shadow-pirate">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-pirate-accent font-cinzel">
            🚫 Forbidden Treasure! 🚫
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center mb-4">
          <p className="text-pirate-accent">Enter the Captain's code to access {gameTitle}</p>
          <p className="text-xs text-pirate-text/60 mt-2">(You can snag the code from our Discord tavern.)</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            type="text" 
            value={code} 
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter secret code..."
            className="bg-pirate-background border-pirate-accent/30 text-pirate-text"
          />
          
          <Button 
            type="submit" 
            className="w-full bg-pirate-action hover:bg-pirate-action/80 shadow-pirate border border-pirate-accent/50"
          >
            Unlock Treasure
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SecretCodeModal;
