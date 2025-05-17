
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Database } from 'lucide-react';
import CredentialSharingModal from '@/components/CredentialSharingModal';
import { useToast } from '@/hooks/use-toast';

const CredentialShareButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleImportSuccess = () => {
    toast({
      title: "Credentials updated",
      description: "Login credentials have been updated successfully.",
      duration: 5000,
    });
  };

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        variant="outline" 
        className="flex gap-2 items-center text-xs py-1 px-3 h-auto border border-gray-300 bg-white/50"
      >
        <Database size={12} />
        Import Credentials
      </Button>

      <CredentialSharingModal 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onImportSuccess={handleImportSuccess}
      />
    </>
  );
};

export default CredentialShareButton;
