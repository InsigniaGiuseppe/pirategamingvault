
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
      <DialogContent className="bg-netflix-background border-netflix-red/50 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            🚫 Forbidden Treasure! 🚫
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center mb-4">
          <p className="text-pirate-gold">Enter the Captain's code to access {gameTitle}</p>
          <p className="text-xs text-gray-400 mt-2">(You can snag the code from our Discord tavern.)</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            type="text" 
            value={code} 
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter secret code..."
            className="bg-[#333] border-pirate-gold/30 text-white"
          />
          
          <Button 
            type="submit" 
            className="w-full bg-netflix-red hover:bg-netflix-red/80"
          >
            Unlock Treasure
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SecretCodeModal;
