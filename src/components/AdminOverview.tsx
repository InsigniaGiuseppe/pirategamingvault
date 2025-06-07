import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { activityLogger } from '@/services/activityLoggingService';
import { BarChart, Users, Activity, DollarSign, TrendingUp, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface User {
  id: string;
  username: string;
  balance: number;
  created_at: string;
  source: 'profiles' | 'custom_users';
}

interface ActivityLog {
  id: string;
  user_id?: string;
  activity_type: string;
  description: string;
  created_at: string;
  metadata?: Record<string, any>;
}

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  description?: string;
  type: string;
  created_at: string;
}

interface OverviewStats {
  totalUsers: number;
  totalBalance: number;
  averageBalance: number;
  totalTransactions: number;
  profilesCount: number;
  customUsersCount: number;
}

const AdminOverview = () => {
  const [stats, setStats] = useState<OverviewStats>({
    totalUsers: 0,
    totalBalance: 0,
    averageBalance: 0,
    totalTransactions: 0,
    profilesCount: 0,
    customUsersCount: 0
  });
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchOverviewData = async () => {
    setLoading(true);
    try {
      // Fetch users and calculate stats
      const [profilesResult, customUsersResult, balancesResult, transactionsResult] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('custom_users').select('*'),
        supabase.from('user_balance').select('*'),
        supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(100)
      ]);

      const profiles = profilesResult.data || [];
      const customUsers = customUsersResult.data || [];
      const balances = balancesResult.data || [];
      const transactions = transactionsResult.data || [];

      // Calculate stats
      const totalUsers = profiles.length + customUsers.length;
      const totalBalance = balances.reduce((sum, b) => sum + (b.balance || 0), 0);
      const averageBalance = totalUsers > 0 ? Math.round(totalBalance / totalUsers) : 0;

      setStats({
        totalUsers,
        totalBalance,
        averageBalance,
        totalTransactions: transactions.length,
        profilesCount: profiles.length,
        customUsersCount: customUsers.length
      });

      setRecentTransactions(transactions.slice(0, 10));

      // Fetch recent activity with proper type handling
      const { logs } = await activityLogger.getActivityLogs(10);
      
      // Convert the logs to match our ActivityLog interface
      const typedLogs: ActivityLog[] = logs.map(log => ({
        id: log.id,
        user_id: log.user_id,
        activity_type: log.activity_type,
        description: log.description,
        created_at: log.created_at,
        metadata: typeof log.metadata === 'object' && log.metadata !== null 
          ? log.metadata as Record<string, any>
          : {}
      }));
      
      setRecentActivity(typedLogs);

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching overview data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
    
    // Set up real-time subscriptions
    const activitySubscription = supabase
      .channel('admin-activity')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_logs' }, () => {
        fetchOverviewData();
      })
      .subscribe();

    const transactionSubscription = supabase
      .channel('admin-transactions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        fetchOverviewData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(activitySubscription);
      supabase.removeChannel(transactionSubscription);
    };
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return '🔑';
      case 'logout': return '🚪';
      case 'registration': return '👤';
      case 'video_watched': return '📺';
      case 'game_unlocked': return '🎮';
      case 'coins_earned': return '💰';
      case 'admin_action': return '⚙️';
      default: return '📝';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earn': return 'text-green-600';
      case 'spend': return 'text-red-600';
      case 'admin': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Auth: {stats.profilesCount}, Custom: {stats.customUsersCount}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBalance}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {stats.averageBalance} per user
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">
              Recent activity tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Online</div>
            <p className="text-xs text-muted-foreground">
              Last refresh: {format(lastRefresh, 'HH:mm:ss')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Button variant="outline" size="sm" onClick={fetchOverviewData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                    <span className="text-lg">{getActivityIcon(activity.activity_type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {activity.activity_type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(activity.created_at), 'MMM d, HH:mm')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {recentActivity.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No recent activity</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {transaction.description || 'Transaction'}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {transaction.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(transaction.created_at), 'MMM d, HH:mm')}
                        </span>
                      </div>
                    </div>
                    <div className={`font-bold ${getTransactionColor(transaction.type)}`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                    </div>
                  </div>
                ))}
                {recentTransactions.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No recent transactions</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;
