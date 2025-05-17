
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal = ({ isOpen, onConfirm, onCancel }: ConfirmationModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="bg-white rounded-xl shadow-saas border-none text-black max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-black font-heading flex flex-col items-center gap-3 pb-2">
            <AlertCircle className="text-black h-8 w-8 mb-1" />
            DOUBLE CHECK
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center mb-6 mt-2">
          <p className="text-black text-lg font-medium">Are you sure you want to carry on?</p>
          <div className="mt-8 flex justify-center w-full">
            <img 
              src="/lovable-uploads/e658c565-6755-4834-9495-f23f5cbac18c.png" 
              alt="Pirate Gaming Logo" 
              className="h-16 mb-4"
              style={{ filter: 'brightness(0)' }}
            />
          </div>
          
          {/* Removed the ship animation and just kept a simple progress bar */}
          <div className="mt-4 w-full h-1 bg-gray-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 h-full w-1/2 bg-black"></div>
          </div>
        </div>
        
        <div className="flex flex-col space-y-3">
          <Button 
            onClick={onConfirm} 
            className="bg-white text-black border-2 border-black w-full py-5 hover:bg-black hover:text-white"
          >
            YES, I'M SURE
          </Button>
          
          <Button 
            onClick={onCancel}
            variant="outline"
            className="border-2 border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-black w-full py-3"
          >
            NO, TAKE ME BACK
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationModal;
