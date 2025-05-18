
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

  // Component is now empty as we've removed the Import Credentials button
  return null;
};

export default CredentialShareButton;
