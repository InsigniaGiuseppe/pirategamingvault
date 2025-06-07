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
import { Clipboard, Download, LogOut, Plus, Settings, Trash, Share2, Coins, TestTube } from 'lucide-react';
import CredentialFormModal from '@/components/CredentialFormModal';
import CredentialSharingModal from '@/components/CredentialSharingModal';
import AdminSettings from '@/components/AdminSettings';
import Navigation from '@/components/Navigation';
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from '@/components/ui/scroll-area';
import { processVideoUrl, getWorkingVideoExamples, formatDuration, testUrlDetection } from '@/utils/videoProcessor';
import EnhancedUserTable from '@/components/EnhancedUserTable';
import UserDetailsModal from '@/components/UserDetailsModal';
import EnhancedTransactionHistory from '@/components/EnhancedTransactionHistory';

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
  const [databaseUsers, setDatabaseUsers] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSharingOpen, setIsSharingOpen] = useState(false);
  const [editingCredential, setEditingCredential] = useState<Credential | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isCoinDialogOpen, setIsCoinDialogOpen] = useState(false);
  const [coinAmount, setCoinAmount] = useState<number>(10);
  const [coinAction, setCoinAction] = useState<'add' | 'remove'>('add');
  const [coinReason, setCoinReason] = useState<string>('');
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [isVideoManagerOpen, setIsVideoManagerOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any>(null);
  const [videoList, setVideoList] = useState<any[]>([]);
  const [urlTestResult, setUrlTestResult] = useState<any>(null);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<any | null>(null);
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is logged in
    const isAdminLoggedIn = localStorage.getItem('pirateAdminLoggedIn') === 'true';
    if (!isAdminLoggedIn) {
      navigate('/admin/login');
      return;
    }

    // Load credentials (for admin users)
    loadCredentials();
    
    // Load database users (for registered users)
    loadDatabaseUsers();
    
    // Load all transactions
    loadAllTransactions();
    
    // Load videos for Watch & Earn
    loadVideos();
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

  const loadDatabaseUsers = async () => {
    try {
      const { getAllDatabaseUsers } = await import('@/services/databaseUserService');
      const users = await getAllDatabaseUsers();
      setDatabaseUsers(users);
      console.log('Loaded database users:', users);
    } catch (error) {
      console.error('Error loading database users:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to load database users',
        description: 'There was a problem loading users from the database.',
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

  const loadVideos = () => {
    // Get videos from localStorage, or initialize with default values
    const savedVideos = localStorage.getItem('watchEarnVideos');
    if (savedVideos) {
      try {
        setVideoList(JSON.parse(savedVideos));
      } catch (e) {
        console.error('Error parsing videos', e);
        initializeDefaultVideos();
      }
    } else {
      initializeDefaultVideos();
    }
  };
  
  const initializeDefaultVideos = () => {
    const defaultVideos = getWorkingVideoExamples();
    setVideoList(defaultVideos);
    localStorage.setItem('watchEarnVideos', JSON.stringify(defaultVideos));
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
  
  const handleOpenCoinDialog = (username: string, action: 'add' | 'remove', userId?: string) => {
    setSelectedUser(username);
    setSelectedUserId(userId || null);
    setCoinAction(action);
    setCoinAmount(action === 'add' ? 10 : 5);
    setCoinReason(action === 'add' ? 'Admin bonus' : 'Admin deduction');
    setIsCoinDialogOpen(true);
  };
  
  const handleModifyCoins = async () => {
    if (!selectedUser) return;
    
    const amount = coinAction === 'add' ? coinAmount : -coinAmount;
    
    // If it's a database user, update in database
    if (selectedUserId) {
      try {
        const { updateDatabaseUserBalance } = await import('@/services/databaseUserService');
        const success = await updateDatabaseUserBalance(
          selectedUserId,
          amount,
          `${coinReason} [admin]`,
          'admin'
        );
        
        if (success) {
          // Refresh database users
          loadDatabaseUsers();
          
          toast({
            title: 'Coins Updated',
            description: `${coinAction === 'add' ? 'Added' : 'Removed'} ${coinAmount} coins ${coinAction === 'add' ? 'to' : 'from'} ${selectedUser}'s account.`,
          });
        } else {
          toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: 'Failed to update user balance in database.',
          });
        }
      } catch (error) {
        console.error('Error updating database user balance:', error);
        toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: 'An error occurred while updating user balance.',
        });
      }
    } else {
      // Legacy localStorage handling for old credential users
      const currentCoins = parseInt(localStorage.getItem(`pirateCoins`) || '0');
      const newBalance = Math.max(0, currentCoins + amount);
      
      localStorage.setItem(`pirateCoins`, newBalance.toString());
      
      const transaction = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        amount: amount,
        description: `${coinReason} [admin]`,
        type: 'admin' as const
      };
      
      const existingTransactions = JSON.parse(localStorage.getItem(`pirateTransactions`) || '[]');
      const updatedTransactions = [...existingTransactions, transaction];
      localStorage.setItem(`pirateTransactions`, JSON.stringify(updatedTransactions));
      
      toast({
        title: 'Coins Updated',
        description: `${coinAction === 'add' ? 'Added' : 'Removed'} ${coinAmount} coins ${coinAction === 'add' ? 'to' : 'from'} ${selectedUser}'s account.`,
      });
    }
    
    // Refresh data and close dialog
    loadAllTransactions();
    setIsCoinDialogOpen(false);
  };
  
  const handleEditVideo = (video: any) => {
    setEditingVideo({...video});
    setUrlTestResult(null);
    setIsVideoManagerOpen(true);
  };
  
  const handleTestUrl = (url: string) => {
    console.log('🧪 Testing URL from admin panel:', url);
    const result = testUrlDetection(url);
    setUrlTestResult(result);
    
    if (result.detected !== 'none') {
      toast({
        title: `Detected: ${result.detected}`,
        description: `Found ${result.patterns.join(', ')} with ID: ${result.id}`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'URL Not Recognized',
        description: 'This URL format is not supported. Please check the console for details.',
      });
    }
  };
  
  const handleProcessVideoUrl = (url: string) => {
    if (!editingVideo) return;

    console.log('🎬 Processing URL from admin panel:', url);
    const processedVideo = processVideoUrl(url);
    
    if (processedVideo) {
      setEditingVideo({
        ...editingVideo,
        type: processedVideo.type,
        url: url,
        embedUrl: processedVideo.embedUrl,
        thumbnail: processedVideo.thumbnail
      });
      
      setUrlTestResult({
        detected: processedVideo.type,
        id: processedVideo.id,
        patterns: [processedVideo.type]
      });
      
      toast({
        title: `✅ URL Processed Successfully`,
        description: `Detected as ${processedVideo.type} and generated embed URL.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: '❌ Invalid URL',
        description: 'Could not process this URL. Check console logs for detailed debugging info.',
      });
    }
  };
  
  const handleSaveVideo = () => {
    if (!editingVideo) return;
    
    // If it's a new video, add it to the list
    if (!editingVideo.id) {
      const newVideo = {
        ...editingVideo,
        id: crypto.randomUUID()
      };
      
      const updatedVideos = [...videoList, newVideo];
      setVideoList(updatedVideos);
      localStorage.setItem('watchEarnVideos', JSON.stringify(updatedVideos));
    } else {
      // Update existing video
      const updatedVideos = videoList.map(video => 
        video.id === editingVideo.id ? editingVideo : video
      );
      
      setVideoList(updatedVideos);
      localStorage.setItem('watchEarnVideos', JSON.stringify(updatedVideos));
    }
    
    // Close dialog and notify
    setIsVideoManagerOpen(false);
    setEditingVideo(null);
    setUrlTestResult(null);
    toast({
      title: 'Video Updated',
      description: 'The video has been updated successfully.',
    });
  };

  const handleViewUserDetails = (user: any) => {
    setSelectedUserForDetails(user);
    setIsUserDetailsOpen(true);
  };

  const handleUpdateBalanceFromModal = async (userId: string, amount: number, description: string, action: 'add' | 'remove') => {
    const finalAmount = action === 'add' ? amount : -amount;
    
    try {
      const { updateDatabaseUserBalance } = await import('@/services/databaseUserService');
      const success = await updateDatabaseUserBalance(
        userId,
        finalAmount,
        `${description} [admin]`,
        'admin'
      );
      
      if (success) {
        loadDatabaseUsers();
        
        // Update the selected user for details modal
        const updatedUsers = await import('@/services/databaseUserService').then(module => module.getAllDatabaseUsers());
        const updatedUser = updatedUsers.find(u => u.id === userId);
        if (updatedUser) {
          setSelectedUserForDetails(updatedUser);
        }
        
        toast({
          title: 'Balance Updated',
          description: `${action === 'add' ? 'Added' : 'Removed'} ${amount} coins successfully.`,
        });
      }
    } catch (error) {
      console.error('Error updating balance:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Failed to update user balance.',
      });
    }
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

        <Tabs defaultValue="users">
          <TabsList className="mb-6">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="credentials">Admin Credentials</TabsTrigger>
            <TabsTrigger value="transactions">Transaction Analytics</TabsTrigger>
            <TabsTrigger value="videos">Watch & Earn Videos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            <EnhancedUserTable
              users={databaseUsers}
              onViewDetails={handleViewUserDetails}
              onAddCoins={(username, userId) => handleOpenCoinDialog(username, 'add', userId)}
              onRemoveCoins={(username, userId) => handleOpenCoinDialog(username, 'remove', userId)}
              onRefresh={loadDatabaseUsers}
            />
          </TabsContent>
          
          <TabsContent value="credentials">
            <div className="bg-white rounded-xl p-6 shadow-saas">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-black">Admin Credentials</h2>
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
                          No admin credentials found. Add a new credential to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="transactions">
            <EnhancedTransactionHistory
              transactions={allTransactions}
              databaseUsers={databaseUsers}
            />
          </TabsContent>
          
          <TabsContent value="videos">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Watch & Earn Videos</h2>
                  <Button 
                    onClick={() => {
                      setEditingVideo({
                        type: 'youtube',
                        title: '',
                        thumbnail: '',
                        duration: '180',
                        durationDisplay: '3:00',
                        reward: 15,
                        url: '',
                        embedUrl: ''
                      });
                      setUrlTestResult(null);
                      setIsVideoManagerOpen(true);
                    }}
                    className="bg-white text-black border-2 border-black hover:bg-black hover:text-white"
                  >
                    <Plus size={18} className="mr-2" />
                    Add New Video
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videoList.map(video => (
                    <Card key={video.id} className="overflow-hidden">
                      <div className="relative h-36">
                        <img 
                          src={video.thumbnail} 
                          alt={video.title} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/lovable-uploads/69fae18f-9c67-48fd-8006-c6181610037b.png';
                          }}
                        />
                        <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                          {video.durationDisplay}
                        </div>
                        <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                          {video.type === 'twitch-clip' ? 'Clip' : video.type === 'twitch' ? 'Twitch' : 'YouTube'}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium mb-1 line-clamp-1">{video.title}</h3>
                        <div className="flex items-center text-sm text-gray-600 mb-3">
                          <Coins size={14} className="text-yellow-500 mr-1" />
                          <span>{video.reward} coins</span>
                        </div>
                        <Button 
                          onClick={() => handleEditVideo(video)}
                          className="w-full bg-white border text-black hover:bg-gray-50"
                        >
                          Edit Video
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
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
      
      <Dialog open={isVideoManagerOpen} onOpenChange={setIsVideoManagerOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{editingVideo && editingVideo.id ? 'Edit Video' : 'Add New Video'}</DialogTitle>
            <DialogDescription>
              Enter a YouTube, Twitch, or Twitch clip URL to automatically fetch video details.
            </DialogDescription>
          </DialogHeader>
          
          {editingVideo && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="video-url">Video URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="video-url"
                    value={editingVideo.url}
                    onChange={(e) => setEditingVideo({...editingVideo, url: e.target.value})}
                    placeholder="https://youtube.com/watch?v=... or https://clips.twitch.tv/..."
                    className="flex-1"
                  />
                  <Button 
                    onClick={() => handleTestUrl(editingVideo.url)}
                    variant="outline"
                    disabled={!editingVideo.url}
                    className="flex items-center gap-1"
                  >
                    <TestTube size={16} />
                    Test
                  </Button>
                  <Button 
                    onClick={() => handleProcessVideoUrl(editingVideo.url)}
                    variant="outline"
                    disabled={!editingVideo.url}
                  >
                    Process
                  </Button>
                </div>
                
                {urlTestResult && (
                  <div className={`p-3 rounded border text-sm ${
                    urlTestResult.detected !== 'none' 
                      ? 'bg-green-50 border-green-200 text-green-800' 
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                    {urlTestResult.detected !== 'none' ? (
                      <>
                        <p className="font-medium">✅ URL Detection Success:</p>
                        <p>Type: <strong>{urlTestResult.detected}</strong></p>
                        <p>ID: <strong>{urlTestResult.id}</strong></p>
                        <p>Patterns: {urlTestResult.patterns.join(', ')}</p>
                      </>
                    ) : (
                      <>
                        <p className="font-medium">❌ URL Not Recognized</p>
                        <p>Please check the console for detailed debugging information.</p>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="video-title">Title</Label>
                <Input
                  id="video-title"
                  value={editingVideo.title}
                  onChange={(e) => setEditingVideo({...editingVideo, title: e.target.value})}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="video-type">Video Type</Label>
                <select
                  id="video-type"
                  value={editingVideo.type}
                  onChange={(e) => setEditingVideo({...editingVideo, type: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="youtube">YouTube</option>
                  <option value="twitch">Twitch Stream</option>
                  <option value="twitch-clip">Twitch Clip</option>
                </select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="video-embed">Embed URL</Label>
                <Input
                  id="video-embed"
                  value={editingVideo.embedUrl}
                  onChange={(e) => setEditingVideo({...editingVideo, embedUrl: e.target.value})}
                  placeholder="Auto-generated when processing URL"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="video-duration">Duration (seconds)</Label>
                  <Input
                    id="video-duration"
                    type="number"
                    value={editingVideo.duration}
                    onChange={(e) => {
                      const duration = parseInt(e.target.value) || 0;
                      const durationDisplay = formatDuration(duration);
                      
                      setEditingVideo({
                        ...editingVideo, 
                        duration: e.target.value,
                        durationDisplay
                      });
                    }}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="video-reward">Coin Reward</Label>
                  <Input
                    id="video-reward"
                    type="number"
                    value={editingVideo.reward}
                    onChange={(e) => setEditingVideo({...editingVideo, reward: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="video-thumbnail">Thumbnail URL</Label>
                <Input
                  id="video-thumbnail"
                  value={editingVideo.thumbnail}
                  onChange={(e) => setEditingVideo({...editingVideo, thumbnail: e.target.value})}
                  placeholder="Auto-generated when processing URL"
                />
              </div>
              
              {editingVideo.thumbnail && (
                <div className="grid gap-2">
                  <Label>Thumbnail Preview</Label>
                  <img 
                    src={editingVideo.thumbnail} 
                    alt="Thumbnail preview" 
                    className="w-full h-32 object-cover rounded border"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/lovable-uploads/69fae18f-9c67-48fd-8006-c6181610037b.png';
                    }}
                  />
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVideoManagerOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveVideo}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <UserDetailsModal
        isOpen={isUserDetailsOpen}
        onClose={() => setIsUserDetailsOpen(false)}
        user={selectedUserForDetails}
        onUpdateBalance={handleUpdateBalanceFromModal}
      />
    </div>
  );
};

export default Admin;
