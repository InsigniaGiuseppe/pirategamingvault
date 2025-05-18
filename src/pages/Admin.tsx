
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getCredentials,
  toggleCredentialStatus,
  deleteCredential,
  Credential,
  exportCredentialsAsCSV
} from '@/services/credentialService';
import { useToast } from '@/hooks/use-toast';
import { Clipboard, Download, LogOut, Plus, Settings, Trash, Share2, Coins } from 'lucide-react';
import CredentialFormModal from '@/components/CredentialFormModal';
import CredentialSharingModal from '@/components/CredentialSharingModal';
import AdminSettings from '@/components/AdminSettings';
import Navigation from '@/components/Navigation';
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from '@/components/ui/scroll-area';

interface Transaction {
  id: string;
  timestamp: number;
  amount: number;
  description: string;
  type: 'earn' | 'spend' | 'admin';
  username?: string;
}

const Admin = () => {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSharingOpen, setIsSharingOpen] = useState(false);
  const [editingCredential, setEditingCredential] = useState<Credential | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isCoinDialogOpen, setIsCoinDialogOpen] = useState(false);
  const [coinAmount, setCoinAmount] = useState<number>(10);
  const [coinAction, setCoinAction] = useState<'add' | 'remove'>('add');
  const [coinReason, setCoinReason] = useState<string>('');
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
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
    
    // Load all transactions
    loadAllTransactions();
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

  const loadAllTransactions = () => {
    // In a real application, these would be fetched from a backend
    // Here we're simulating by collecting from localStorage for each user
    const transactions: Transaction[] = [];
    
    // For each credential, check localStorage for their transactions
    credentials.forEach(cred => {
      // Simulate accessing the user's transactions
      // In reality we'd need a proper backend to store these per user
      const userTransactions = JSON.parse(localStorage.getItem(`${cred.username}_transactions`) || '[]');
      
      // Add username to each transaction and add to all transactions
      userTransactions.forEach((tx: Transaction) => {
        transactions.push({
          ...tx,
          username: cred.username
        });
      });
    });
    
    // Sort by timestamp, newest first
    transactions.sort((a, b) => b.timestamp - a.timestamp);
    setAllTransactions(transactions);
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
  
  const handleOpenCoinDialog = (username: string, action: 'add' | 'remove') => {
    setSelectedUser(username);
    setCoinAction(action);
    setCoinAmount(action === 'add' ? 10 : 5);
    setCoinReason(action === 'add' ? 'Admin bonus' : 'Admin deduction');
    setIsCoinDialogOpen(true);
  };
  
  const handleModifyCoins = () => {
    if (!selectedUser) return;
    
    // Get user's current coin balance
    const currentCoins = parseInt(localStorage.getItem(`${selectedUser}_coins`) || '0');
    
    // Calculate new balance
    const amount = coinAction === 'add' ? coinAmount : -coinAmount;
    const newBalance = Math.max(0, currentCoins + amount);
    
    // Update user's coin balance in localStorage
    localStorage.setItem(`${selectedUser}_coins`, newBalance.toString());
    
    // Add transaction record
    const transaction = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      amount: amount,
      description: `${coinReason} [admin]`,
      type: 'admin' as const
    };
    
    // Get existing transactions
    const existingTransactions = JSON.parse(localStorage.getItem(`${selectedUser}_transactions`) || '[]');
    
    // Add new transaction
    const updatedTransactions = [...existingTransactions, transaction];
    localStorage.setItem(`${selectedUser}_transactions`, JSON.stringify(updatedTransactions));
    
    // Refresh data
    loadAllTransactions();
    
    // Close dialog and notify
    setIsCoinDialogOpen(false);
    toast({
      title: 'Coins Updated',
      description: `${coinAction === 'add' ? 'Added' : 'Removed'} ${coinAmount} coins ${coinAction === 'add' ? 'to' : 'from'} ${selectedUser}'s account.`,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-black font-heading">Admin Panel</h1>
          
          <div className="flex gap-3">
            <Button
              onClick={() => setIsSharingOpen(true)}
              variant="outline"
              className="border-2 border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-black"
            >
              <Share2 size={18} className="mr-2" />
              Share Credentials
            </Button>
          
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

        <Tabs defaultValue="credentials">
          <TabsList className="mb-6">
            <TabsTrigger value="credentials">User Credentials</TabsTrigger>
            <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="credentials">
            <div className="bg-white rounded-xl p-6 shadow-saas">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-black">User Management</h2>
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
                      <TableHead>Coins</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {credentials.map((cred) => {
                      // Get user's coin balance from localStorage
                      const userCoins = parseInt(localStorage.getItem(`${cred.username}_coins`) || '0');
                      
                      return (
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
                          <TableCell className="text-center">
                            <div className="flex items-center gap-1">
                              <Coins size={16} className="text-yellow-500" />
                              {userCoins}
                            </div>
                          </TableCell>
                          <TableCell>{new Date(cred.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button 
                                onClick={() => handleOpenCoinDialog(cred.username, 'add')}
                                variant="outline" 
                                size="sm"
                                className="h-8 px-2 border border-green-300 text-green-600 hover:bg-green-50"
                              >
                                Add Coins
                              </Button>
                              <Button 
                                onClick={() => handleOpenCoinDialog(cred.username, 'remove')}
                                variant="outline" 
                                size="sm"
                                className="h-8 px-2 border border-orange-300 text-orange-600 hover:bg-orange-50"
                              >
                                Remove Coins
                              </Button>
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
                      )}
                    )}
                    {credentials.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          No credentials found. Add a new credential to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="transactions">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Transaction History</h2>
                <ScrollArea className="h-[500px] rounded-md border p-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allTransactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell className="font-mono text-xs">
                            {new Date(tx.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell className="font-medium">{tx.username}</TableCell>
                          <TableCell className={tx.amount >= 0 ? "text-green-600" : "text-red-600"}>
                            {tx.amount >= 0 ? `+${tx.amount}` : tx.amount}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              tx.type === 'earn' ? 'bg-emerald-100 text-emerald-800' : 
                              tx.type === 'spend' ? 'bg-orange-100 text-orange-800' : 
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {tx.type}
                            </span>
                          </TableCell>
                          <TableCell>{tx.description}</TableCell>
                        </TableRow>
                      ))}
                      {allTransactions.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                            No transactions found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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

      <CredentialSharingModal
        isOpen={isSharingOpen}
        onClose={() => setIsSharingOpen(false)}
        onImportSuccess={loadCredentials}
      />

      <AdminSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      
      <Dialog open={isCoinDialogOpen} onOpenChange={setIsCoinDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{coinAction === 'add' ? 'Add' : 'Remove'} Pirate Coins</DialogTitle>
            <DialogDescription>
              {coinAction === 'add' 
                ? `Add Pirate Coins to ${selectedUser}'s account.` 
                : `Remove Pirate Coins from ${selectedUser}'s account.`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              <Label htmlFor="coin-amount" className="text-right w-20">
                Amount
              </Label>
              <Input
                id="coin-amount"
                type="number"
                min="1"
                value={coinAmount}
                onChange={(e) => setCoinAmount(parseInt(e.target.value) || 0)}
                className="col-span-3"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <Label htmlFor="coin-reason" className="text-right w-20">
                Reason
              </Label>
              <Input
                id="coin-reason"
                value={coinReason}
                onChange={(e) => setCoinReason(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCoinDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleModifyCoins}
              className={coinAction === 'add' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}
            >
              <Coins size={16} className="mr-2" />
              Confirm {coinAction === 'add' ? 'Add' : 'Remove'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
