
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
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
  );
};

export default SecretCodeModal;
