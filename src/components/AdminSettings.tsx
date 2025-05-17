
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateAdminCredentials } from '@/services/credentialService';

interface AdminSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminSettings = ({ isOpen, onClose }: AdminSettingsProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Passwords do not match',
        description: 'Please ensure both password fields match.'
      });
      return;
    }
    
    try {
      const updated = updateAdminCredentials(username, password);
      
      if (updated) {
        toast({
          title: 'Admin credentials updated',
          description: 'Your admin credentials have been updated. You will need to use these for your next login.'
        });
        onClose();
      } else {
        toast({
          variant: 'destructive',
          title: 'Failed to update',
          description: 'Could not update admin credentials.'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An error occurred while updating admin credentials.'
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white rounded-xl shadow-saas border-none max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-black text-center">
            Admin Settings
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
            <Label htmlFor="adminUsername">New Admin Username</Label>
            <Input
              id="adminUsername"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter new admin username"
              required
              className="bg-white border-2 border-gray-300 text-black focus:border-black focus:ring-black"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminPassword">New Password</Label>
            <Input
              id="adminPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              required
              className="bg-white border-2 border-gray-300 text-black focus:border-black focus:ring-black"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              className="bg-white border-2 border-gray-300 text-black focus:border-black focus:ring-black"
            />
          </div>

          <div className="pt-4 flex flex-col space-y-3">
            <Button 
              type="submit" 
              className="bg-white text-black border-2 border-black hover:bg-black hover:text-white"
            >
              Update Admin Credentials
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

export default AdminSettings;
