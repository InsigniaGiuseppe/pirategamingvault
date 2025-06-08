import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import EnhancedUserTable from '@/components/EnhancedUserTable';
import EnhancedTransactionHistory from '@/components/EnhancedTransactionHistory';
import UserDetailsModal from '@/components/UserDetailsModal';
import ActivityLogViewer from '@/components/ActivityLogViewer';
import AdminOverview from '@/components/AdminOverview';
import { Button } from '@/components/ui/button';
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Settings, History, Video, Activity } from 'lucide-react';
import { activityLogger } from '@/services/activityLoggingService';
import AdminVideoManager from '@/components/AdminVideoManager';
import OptimizedTransactionHistory from '@/components/OptimizedTransactionHistory';
import { DatabaseService } from '@/services/databaseService';

interface User {
  id: string;
  username: string;
  balance: number;
  created_at: string;
  transactions?: any[];
  source: 'profiles' | 'custom_users';
}

const Admin = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshUsers, setRefreshUsers] = useState(false);
  const [operationLoading, setOperationLoading] = useState<string | null>(null);
  const [cancelOperations, setCancelOperations] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [refreshUsers, activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [profilesResult, customUsersResult, balancesResult, transactionsResult] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('custom_users').select('*').order('created_at', { ascending: false }),
        supabase.from('user_balance').select('*'),
        supabase.from('transactions').select('*').order('created_at', { ascending: false })
      ]);

      const profiles = profilesResult.data || [];
      const customUsers = customUsersResult.data || [];
      const balances = balancesResult.data || [];
      const transactions = transactionsResult.data || [];

      const profileUsers: User[] = profiles.map(profile => {
        const userBalance = balances?.find(b => b.user_id === profile.id);
        const userTransactions = transactions?.filter(t => t.user_id === profile.id) || [];
        return {
          id: profile.id,
          username: profile.username,
          balance: userBalance?.balance || 0,
          created_at: profile.created_at,
          transactions: userTransactions,
          source: 'profiles' as const
        };
      });

      const customUsersList: User[] = customUsers.map(customUser => {
        const userBalance = balances?.find(b => b.user_id === customUser.id);
        const userTransactions = transactions?.filter(t => t.user_id === customUser.id) || [];
        return {
          id: customUser.id,
          username: customUser.username,
          balance: userBalance?.balance || 0,
          created_at: customUser.created_at,
          transactions: userTransactions,
          source: 'custom_users' as const
        };
      });

      const allUsers = [...profileUsers, ...customUsersList].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setUsers(allUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const cancelOperation = (operationId: string) => {
    setCancelOperations(prev => new Set([...prev, operationId]));
    setOperationLoading(null);
    
    toast({
      title: "Operation Cancelled",
      description: "The operation has been cancelled",
    });
  };

  const handleAddCoins = async (username: string, userId: string) => {
    const amount = parseInt(prompt(`Enter amount of coins to add to ${username}'s balance:`) || '0');
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive number",
        variant: "destructive",
      });
      return;
    }

    if (amount > 10000) {
      const confirmed = confirm(`You're about to add ${amount} coins. This is a large amount. Are you sure?`);
      if (!confirmed) return;
    }

    const operationId = `add-${userId}`;
    setOperationLoading(operationId);
    setCancelOperations(prev => {
      const newSet = new Set(prev);
      newSet.delete(operationId);
      return newSet;
    });

    try {
      const result = await DatabaseService.safeExecuteRPC('add_coins', {
        user_id: userId,
        amount: amount,
        description: `Admin added ${amount} coins`
      });

      if (cancelOperations.has(operationId)) {
        return;
      }

      if (!result.success) {
        toast({
          title: "Database Error",
          description: result.error || 'Failed to add coins',
          variant: "destructive",
        });
        return;
      }

      // Log activity
      try {
        await activityLogger.logAdminAction(
          'admin-user-id',
          `Added ${amount} coins to ${username}`,
          userId,
          { amount, username }
        );
      } catch (activityError) {
        console.warn('Failed to log activity:', activityError);
      }
      
      toast({
        title: "Success",
        description: `Successfully added ${amount} coins to ${username}'s balance`,
      });
      
      setRefreshUsers(prev => !prev);
      
    } catch (error: any) {
      console.error('Error in handleAddCoins:', error);
      toast({
        title: "Error",
        description: `Failed to add coins: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setOperationLoading(null);
    }
  };

  const handleRemoveCoins = async (username: string, userId: string) => {
    const amount = parseInt(prompt(`Enter amount of coins to remove from ${username}'s balance:`) || '0');
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive number",
        variant: "destructive",
      });
      return;
    }

    if (amount > 10000) {
      const confirmed = confirm(`You're about to remove ${amount} coins. This is a large amount. Are you sure?`);
      if (!confirmed) return;
    }

    const operationId = `remove-${userId}`;
    setOperationLoading(operationId);
    setCancelOperations(prev => {
      const newSet = new Set(prev);
      newSet.delete(operationId);
      return newSet;
    });

    try {
      const result = await DatabaseService.safeExecuteRPC('remove_coins', {
        user_id: userId,
        amount: amount,
        description: `Admin removed ${amount} coins`
      });

      if (cancelOperations.has(operationId)) {
        return;
      }

      if (!result.success) {
        toast({
          title: "Database Error",
          description: result.error || 'Failed to remove coins',
          variant: "destructive",
        });
        return;
      }

      // Log activity
      try {
        await activityLogger.logAdminAction(
          'admin-user-id',
          `Removed ${amount} coins from ${username}`,
          userId,
          { amount, username }
        );
      } catch (activityError) {
        console.warn('Failed to log activity:', activityError);
      }
      
      toast({
        title: "Success",
        description: `Successfully removed ${amount} coins from ${username}'s balance`,
      });
      
      setRefreshUsers(prev => !prev);
      
    } catch (error: any) {
      console.error('Error in handleRemoveCoins:', error);
      toast({
        title: "Error",
        description: `Failed to remove coins: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setOperationLoading(null);
    }
  };

  const handleUpdateBalance = async (userId: string, amount: number, description: string, action: 'add' | 'remove') => {
    if (amount <= 0 || isNaN(amount)) {
      toast({
        title: "Error",
        description: "Please enter a valid positive amount",
        variant: "destructive",
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: "Error",
        description: "Please provide a description for this operation",
        variant: "destructive",
      });
      return;
    }

    const operationId = `${action}-${userId}`;
    setOperationLoading(operationId);
    setCancelOperations(prev => {
      const newSet = new Set(prev);
      newSet.delete(operationId);
      return newSet;
    });

    try {
      const rpcFunction = action === 'add' ? 'add_coins' : 'remove_coins';
      const result = await DatabaseService.safeExecuteRPC(rpcFunction, {
        user_id: userId,
        amount: amount,
        description: `Admin ${action === 'add' ? 'added' : 'removed'} ${amount} coins - ${description}`
      });

      if (cancelOperations.has(operationId)) {
        return;
      }

      if (!result.success) {
        toast({
          title: "Database Error",
          description: result.error || `Failed to ${action} coins`,
          variant: "destructive",
        });
        return;
      }

      // Log activity
      try {
        await activityLogger.logAdminAction(
          'admin-user-id',
          `${action === 'add' ? 'Added' : 'Removed'} ${amount} coins - ${description}`,
          userId,
          { amount, description, action }
        );
      } catch (activityError) {
        console.warn('Failed to log activity:', activityError);
      }
      
      toast({
        title: "Success",
        description: `Successfully ${action === 'add' ? 'added' : 'removed'} ${amount} coins`,
      });
      
      setSelectedUser(null);
      setRefreshUsers(prev => !prev);
      
    } catch (error: any) {
      console.error(`Error in handleUpdateBalance (${action}):`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} coins: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setOperationLoading(null);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'videos', label: 'Videos', icon: Video },
    { id: 'transactions', label: 'Transactions', icon: History },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users, transactions, and system settings</p>
          {operationLoading && (
            <div className="mt-2 flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-gray-600">Operation in progress...</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => cancelOperation(operationLoading)}
                className="ml-2"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-6">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview">
            <AdminOverview />
          </TabsContent>

          <TabsContent value="users">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <EnhancedUserTable
                users={users}
                onViewDetails={setSelectedUser}
                onAddCoins={handleAddCoins}
                onRemoveCoins={handleRemoveCoins}
                onRefresh={fetchUsers}
                operationLoading={operationLoading}
              />
            )}
          </TabsContent>

          <TabsContent value="videos">
            <AdminVideoManager />
          </TabsContent>

          <TabsContent value="transactions">
            <OptimizedTransactionHistory />
          </TabsContent>

          <TabsContent value="activity">
            <ActivityLogViewer />
          </TabsContent>

          <TabsContent value="settings">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
              <p className="text-gray-700">System configuration and preferences.</p>
              <Button onClick={() => alert('Settings saved!')} className="mt-4">Save Settings</Button>
            </div>
          </TabsContent>
        </Tabs>

        <UserDetailsModal
          isOpen={selectedUser !== null}
          onClose={() => setSelectedUser(null)}
          user={selectedUser}
          onUpdateBalance={handleUpdateBalance}
          operationLoading={operationLoading}
        />
      </div>
    </div>
  );
};

export default Admin;
