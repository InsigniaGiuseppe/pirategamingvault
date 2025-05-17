
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  addCredential, 
  updateCredential, 
  Credential, 
  generateAuthCode 
} from '@/services/credentialService';

interface CredentialFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  credential: Credential | null;
}

const CredentialFormModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  credential 
}: CredentialFormModalProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [active, setActive] = useState(true);
  const [isGeneratedAuthCode, setIsGeneratedAuthCode] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (credential) {
      setUsername(credential.username);
      setPassword(credential.password);
      setAuthCode(credential.authCode);
      setActive(credential.active);
      setIsGeneratedAuthCode(false);
    } else {
      setUsername('');
      setPassword('');
      setAuthCode('');
      setActive(true);
      setIsGeneratedAuthCode(false);
    }
  }, [credential, isOpen]);

  const handleGenerateAuthCode = () => {
    setAuthCode(generateAuthCode());
    setIsGeneratedAuthCode(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (credential) {
        // Update existing credential
        updateCredential(credential.id, {
          username,
          password,
          authCode,
          active
        });
        toast({
          title: 'Credential updated',
          description: 'The user credential has been updated successfully.'
        });
      } else {
        // Create new credential
        addCredential(username, password, authCode);
        toast({
          title: 'Credential created',
          description: 'The new user credential has been added successfully.'
        });
      }
      onSubmit();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: (error as Error).message || 'Failed to save credential'
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white rounded-xl shadow-saas border-none max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-black text-center">
            {credential ? 'Edit Credential' : 'New Credential'}
          </DialogTitle>
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X size={16} className="text-black" />
          </button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              className="bg-white border-2 border-gray-300 text-black focus:border-black focus:ring-black"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className="bg-white border-2 border-gray-300 text-black focus:border-black focus:ring-black"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="authCode">Auth Code</Label>
              <Button
                type="button"
                onClick={handleGenerateAuthCode}
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs border border-gray-300"
              >
                Generate
              </Button>
            </div>
            <Input
              id="authCode"
              value={authCode}
              onChange={(e) => {
                setAuthCode(e.target.value);
                setIsGeneratedAuthCode(false);
              }}
              placeholder="Enter or generate auth code"
              className={`bg-white border-2 border-gray-300 text-black focus:border-black focus:ring-black ${
                isGeneratedAuthCode ? 'bg-gray-50' : ''
              }`}
            />
            {isGeneratedAuthCode && (
              <p className="text-xs text-gray-500 mt-1">Auto-generated auth code</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={active}
              onCheckedChange={setActive}
            />
            <Label htmlFor="active">Active account</Label>
          </div>

          <div className="pt-4 flex flex-col space-y-3">
            <Button 
              type="submit" 
              className="bg-white text-black border-2 border-black hover:bg-black hover:text-white"
            >
              {credential ? 'Update Credential' : 'Create Credential'}
            </Button>
            
            <Button 
              type="button"
              onClick={onClose}
              variant="outline"
              className="border-2 border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-black"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CredentialFormModal;
