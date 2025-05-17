
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
      <DialogContent className="bg-[#0c1f2c] border-[#cfb53b] border-2 text-[#cde8e5] max-w-md shadow-[0px_4px_10px_rgba(0,0,0,0.6)]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-[#cfb53b]">
            🚫 Forbidden Treasure! 🚫
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center mb-4">
          <p className="text-[#cfb53b]">Enter the Captain's code to access {gameTitle}</p>
          <p className="text-xs text-[#cde8e5]/60 mt-2">(You can snag the code from our Discord tavern.)</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            type="text" 
            value={code} 
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter secret code..."
            className="bg-[#3b2f2f] border-[#cfb53b]/30 text-[#cde8e5]"
          />
          
          <Button 
            type="submit" 
            className="w-full bg-[#8b0000] hover:bg-[#8b0000]/80 shadow-md"
          >
            Unlock Treasure
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SecretCodeModal;
