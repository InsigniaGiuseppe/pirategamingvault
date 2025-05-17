
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getCredentials,
  toggleCredentialStatus,
  deleteCredential,
  Credential,
  exportCredentialsAsCSV
} from '@/services/credentialService';
import { useToast } from '@/hooks/use-toast';
import { Clipboard, Download, LogOut, Plus, Settings, Trash, X } from 'lucide-react';
import CredentialFormModal from '@/components/CredentialFormModal';
import AdminSettings from '@/components/AdminSettings';
import Navigation from '@/components/Navigation';

const Admin = () => {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingCredential, setEditingCredential] = useState<Credential | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is logged in
    const isAdminLoggedIn = localStorage.getItem('pirateAdminLoggedIn') === 'true';
    if (!isAdminLoggedIn) {
      navigate('/admin/login');
      return;
    }

    // Load credentials
    loadCredentials();
  }, [navigate]);

  const loadCredentials = () => {
    try {
      const loadedCreds = getCredentials();
      setCredentials(loadedCreds);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to load credentials',
        description: 'There was a problem loading the credential store.',
      });
    }
  };

  const handleToggleStatus = (id: string) => {
    try {
      toggleCredentialStatus(id);
      loadCredentials();
      toast({
        title: 'Status updated',
        description: 'Credential status has been updated.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to update status',
        description: 'There was a problem updating the credential status.',
      });
    }
  };

  const handleDelete = (id: string) => {
    try {
      deleteCredential(id);
      loadCredentials();
      toast({
        title: 'Credential deleted',
        description: 'The credential has been removed from the system.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to delete credential',
        description: 'There was a problem deleting the credential.',
      });
    }
  };

  const handleEdit = (credential: Credential) => {
    setEditingCredential(credential);
    setIsFormOpen(true);
  };

  const handleFormSubmit = () => {
    setIsFormOpen(false);
    setEditingCredential(null);
    loadCredentials();
  };

  const handleExportCSV = () => {
    const csv = exportCredentialsAsCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'pirate-credentials.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = () => {
    localStorage.removeItem('pirateAdminLoggedIn');
    navigate('/');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Copied to clipboard',
        description: 'Auth code has been copied to clipboard.',
      });
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-black font-heading">Credential Management</h1>
          
          <div className="flex gap-3">
            <Button
              onClick={() => setIsSettingsOpen(true)}
              variant="outline"
              className="border-2 border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-black"
            >
              <Settings size={18} className="mr-2" />
              Admin Settings
            </Button>
            
            <Button
              onClick={handleExportCSV}
              variant="outline"
              className="border-2 border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-black"
            >
              <Download size={18} className="mr-2" />
              Export CSV
            </Button>

            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-2 border-black text-black hover:bg-black hover:text-white"
            >
              <LogOut size={18} className="mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-saas">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-black">User Credentials</h2>
            <Button
              onClick={() => {
                setEditingCredential(null);
                setIsFormOpen(true);
              }}
              className="bg-white text-black border-2 border-black hover:bg-black hover:text-white"
            >
              <Plus size={18} className="mr-2" />
              New Credential
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Auth Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {credentials.map((cred) => (
                  <TableRow key={cred.id}>
                    <TableCell className="font-medium">{cred.username}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{cred.authCode}</span>
                        <button 
                          onClick={() => copyToClipboard(cred.authCode)} 
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Clipboard size={14} />
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${cred.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {cred.active ? 'Active' : 'Disabled'}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(cred.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          onClick={() => handleEdit(cred)}
                          variant="outline" 
                          size="sm"
                          className="h-8 px-2 border border-gray-300"
                        >
                          Edit
                        </Button>
                        <Button 
                          onClick={() => handleToggleStatus(cred.id)}
                          variant="outline" 
                          size="sm"
                          className="h-8 px-2 border border-gray-300"
                        >
                          {cred.active ? 'Disable' : 'Enable'}
                        </Button>
                        <Button 
                          onClick={() => handleDelete(cred.id)}
                          variant="outline" 
                          size="sm" 
                          className="h-8 px-2 border border-red-300 text-red-500 hover:bg-red-50"
                        >
                          <Trash size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {credentials.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No credentials found. Add a new credential to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>

      <CredentialFormModal 
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingCredential(null);
        }}
        onSubmit={handleFormSubmit}
        credential={editingCredential}
      />

      <AdminSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

export default Admin;
