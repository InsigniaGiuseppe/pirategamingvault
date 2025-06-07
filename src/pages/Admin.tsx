
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import EnhancedUserTable from '@/components/EnhancedUserTable';
import EnhancedTransactionHistory from '@/components/EnhancedTransactionHistory';
import UserDetailsModal from '@/components/UserDetailsModal';
import { Button } from '@/components/ui/button';
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Users, Settings, History, Video } from 'lucide-react';

import AdminVideoManager from '@/components/AdminVideoManager';

interface User {
  id: string;
  username: string;
  balance: number;
  created_at: string;
  transactions?: any[];
}

const Admin = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshUsers, setRefreshUsers] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [refreshUsers]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive",
        });
      } else {
        setUsers(data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddCoins = async (username: string, userId: string) => {
    const amount = parseInt(prompt(`Enter amount of coins to add to ${username}'s balance:`) || '0');
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid positive number.');
      return;
    }

    try {
      const { error } = await supabase.rpc('add_coins', {
        user_id: userId,
        amount: amount,
        description: `Admin added ${amount} coins`
      });

      if (error) {
        console.error('Error adding coins:', error);
        toast({
          title: "Error",
          description: "Failed to add coins",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: `Successfully added ${amount} coins to ${username}'s balance`,
        });
        setRefreshUsers(prev => !prev);
      }
    } catch (error) {
      console.error('Unexpected error adding coins:', error);
      toast({
        title: "Error",
        description: "Unexpected error adding coins",
        variant: "destructive",
      });
    }
  };

  const handleRemoveCoins = async (username: string, userId: string) => {
    const amount = parseInt(prompt(`Enter amount of coins to remove from ${username}'s balance:`) || '0');
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid positive number.');
      return;
    }

    try {
      const { error } = await supabase.rpc('remove_coins', {
        user_id: userId,
        amount: amount,
        description: `Admin removed ${amount} coins`
      });

      if (error) {
        console.error('Error removing coins:', error);
        toast({
          title: "Error",
          description: "Failed to remove coins",
          variant: "destructive",
        });
      } else {
         toast({
          title: "Success",
          description: `Successfully removed ${amount} coins from ${username}'s balance`,
        });
        setRefreshUsers(prev => !prev);
      }
    } catch (error) {
      console.error('Unexpected error removing coins:', error);
      toast({
        title: "Error",
        description: "Unexpected error removing coins",
        variant: "destructive",
      });
    }
  };

  const handleUpdateBalance = async (userId: string, amount: number, description: string, action: 'add' | 'remove') => {
    try {
      const rpcFunctionName = action === 'add' ? 'add_coins' : 'remove_coins';
      const { error } = await supabase.rpc(rpcFunctionName, {
        user_id: userId,
        amount: amount,
        description: `Admin ${action === 'add' ? 'added' : 'removed'} ${amount} coins - ${description}`
      });

      if (error) {
        console.error(`Error ${action === 'add' ? 'adding' : 'removing'} coins:`, error);
        toast({
          title: "Error",
          description: `Failed to ${action === 'add' ? 'add' : 'remove'} coins`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: `Successfully ${action === 'add' ? 'added' : 'removed'} ${amount} coins`,
        });
        setSelectedUser(null);
        setRefreshUsers(prev => !prev);
      }
    } catch (error) {
      console.error(`Unexpected error ${action === 'add' ? 'adding' : 'removing'} coins:`, error);
      toast({
        title: "Error",
        description: `Unexpected error ${action === 'add' ? 'adding' : 'removing'} coins`,
        variant: "destructive",
      });
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'videos', label: 'Video Management', icon: Video },
    { id: 'transactions', label: 'Transaction History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const totalUsers = users.length;
  const totalBalance = users.reduce((sum, user) => sum + (user.balance || 0), 0);
  const totalTransactions = users.reduce((sum, user) => sum + (user.transactions?.length || 0), 0);
  const averageBalance = totalUsers > 0 ? Math.round(totalBalance / totalUsers) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users, transactions, and system settings</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-lg font-semibold text-gray-800">Total Users</h3>
                <p className="text-2xl font-bold text-blue-600">{totalUsers}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-lg font-semibold text-gray-800">Total Balance</h3>
                <p className="text-2xl font-bold text-green-600">{totalBalance}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-lg font-semibold text-gray-800">Avg. Balance</h3>
                <p className="text-2xl font-bold text-purple-600">{averageBalance}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-lg font-semibold text-gray-800">Total Transactions</h3>
                <p className="text-2xl font-bold text-yellow-600">{totalTransactions}</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <EnhancedUserTable
              users={users}
              onViewDetails={setSelectedUser}
              onAddCoins={handleAddCoins}
              onRemoveCoins={handleRemoveCoins}
              onRefresh={fetchUsers}
            />
          </TabsContent>

          <TabsContent value="videos">
            <AdminVideoManager />
          </TabsContent>

          <TabsContent value="transactions">
            <EnhancedTransactionHistory transactions={[]} databaseUsers={users} />
          </TabsContent>

          <TabsContent value="settings">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
              <p className="text-gray-700">Here you can manage various system settings.</p>
              <Button onClick={() => alert('Settings saved!')} className="mt-4">Save Settings</Button>
            </div>
          </TabsContent>
        </Tabs>

        <UserDetailsModal
          isOpen={selectedUser !== null}
          onClose={() => setSelectedUser(null)}
          user={selectedUser}
          onUpdateBalance={handleUpdateBalance}
        />
      </div>
    </div>
  );
};

export default Admin;
