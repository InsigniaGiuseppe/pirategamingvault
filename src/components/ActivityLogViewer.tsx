
import { useState, useEffect, useCallback } from 'react';
import { activityLogger } from '@/services/activityLoggingService';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Search, Filter, Activity, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import type { Json } from '@/integrations/supabase/types';

interface ActivityLog {
  id: string;
  user_id?: string | null;
  activity_type: string;
  description: string;
  metadata: Json | null;
  ip_address?: unknown | null;
  user_agent?: string | null;
  created_at: string;
  username?: string;
}

interface UserInfo {
  id: string;
  username: string;
}

const ActivityLogViewer = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [activityTypeFilter, setActivityTypeFilter] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Separate loading states to prevent conflicts
  const [loadingStates, setLoadingStates] = useState({
    users: false,
    logs: false,
    stats: false,
    refreshing: false
  });

  // Debounce search to prevent rapid API calls
  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(null);

  // Add comprehensive logging
  console.log('📊 ActivityLogViewer - Component state:', {
    logsCount: logs.length,
    usersCount: users.length,
    statsCount: Object.keys(stats).length,
    loadingStates,
    searchTerm,
    activityTypeFilter,
    userIdFilter,
    error
  });

  const updateLoadingState = useCallback((key: keyof typeof loadingStates, value: boolean) => {
    console.log('📊 ActivityLogViewer - Updating loading state:', { key, value });
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  }, []);

  // Fetch users with proper error handling
  const fetchUsers = useCallback(async () => {
    if (loadingStates.users) {
      console.log('📊 ActivityLogViewer - Users already loading, skipping');
      return;
    }
    
    console.log('📊 ActivityLogViewer - Starting to fetch users');
    updateLoadingState('users', true);
    try {
      const [profilesResult, customUsersResult] = await Promise.all([
        supabase.from('profiles').select('id, username'),
        supabase.from('custom_users').select('id, username')
      ]);

      console.log('📊 ActivityLogViewer - Users fetched:', {
        profiles: profilesResult.data?.length || 0,
        customUsers: customUsersResult.data?.length || 0,
        profilesError: profilesResult.error,
        customUsersError: customUsersResult.error
      });

      const profiles = profilesResult.data || [];
      const customUsers = customUsersResult.data || [];
      
      const allUsers: UserInfo[] = [
        ...profiles.map(p => ({ id: p.id, username: p.username })),
        ...customUsers.map(u => ({ id: u.id, username: u.username }))
      ];
      
      console.log('📊 ActivityLogViewer - Total users processed:', allUsers.length);
      setUsers(allUsers);
    } catch (error) {
      console.error('📊 ActivityLogViewer - Error fetching users:', error);
      setUsers([]);
    } finally {
      updateLoadingState('users', false);
    }
  }, [loadingStates.users, updateLoadingState]);

  // Fetch logs with debouncing and proper state management
  const fetchLogs = useCallback(async (immediate = false) => {
    if (loadingStates.logs && !immediate) {
      console.log('📊 ActivityLogViewer - Logs already loading, skipping');
      return;
    }
    if (users.length === 0) {
      console.log('📊 ActivityLogViewer - No users available, skipping logs fetch');
      return;
    }
    
    console.log('📊 ActivityLogViewer - Starting to fetch logs with filters:', {
      searchTerm,
      activityTypeFilter,
      userIdFilter,
      immediate
    });
    
    updateLoadingState('logs', true);
    setError(null);
    
    try {
      const filters = {
        ...(activityTypeFilter && { activityType: activityTypeFilter }),
        ...(userIdFilter && { userId: userIdFilter }),
      };

      console.log('📊 ActivityLogViewer - Calling activityLogger.getActivityLogs with filters:', filters);
      const { logs: fetchedLogs } = await activityLogger.getActivityLogs(100, 0, filters);
      
      console.log('📊 ActivityLogViewer - Raw logs fetched:', {
        count: fetchedLogs.length,
        sample: fetchedLogs.slice(0, 3).map(log => ({
          id: log.id,
          activity_type: log.activity_type,
          user_id: log.user_id,
          description: log.description.substring(0, 50)
        }))
      });
      
      // Add usernames to logs
      const logsWithUsernames = fetchedLogs.map((log) => {
        const user = users.find(u => u.id === log.user_id);
        return {
          ...log,
          username: user?.username || (log.user_id ? 'Unknown User' : 'System')
        };
      });

      console.log('📊 ActivityLogViewer - Logs with usernames processed:', logsWithUsernames.length);

      // Apply search filter
      const filteredLogs = searchTerm 
        ? logsWithUsernames.filter((log) => 
            log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.activity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.username && log.username.toLowerCase().includes(searchTerm.toLowerCase()))
          )
        : logsWithUsernames;

      console.log('📊 ActivityLogViewer - Final filtered logs:', {
        originalCount: logsWithUsernames.length,
        filteredCount: filteredLogs.length,
        searchTerm
      });

      setLogs(filteredLogs);
    } catch (error: any) {
      console.error('📊 ActivityLogViewer - Error fetching activity logs:', error);
      setError('Failed to load activity logs. Please try again.');
      setLogs([]);
    } finally {
      updateLoadingState('logs', false);
    }
  }, [users, activityTypeFilter, userIdFilter, searchTerm, loadingStates.logs, updateLoadingState]);

  // Fetch stats separately
  const fetchStats = useCallback(async () => {
    if (loadingStates.stats) {
      console.log('📊 ActivityLogViewer - Stats already loading, skipping');
      return;
    }
    
    console.log('📊 ActivityLogViewer - Starting to fetch stats');
    updateLoadingState('stats', true);
    try {
      const fetchedStats = await activityLogger.getActivityStats();
      console.log('📊 ActivityLogViewer - Stats fetched:', fetchedStats);
      setStats(fetchedStats as Record<string, number>);
    } catch (error) {
      console.error('📊 ActivityLogViewer - Error fetching activity stats:', error);
      setStats({});
    } finally {
      updateLoadingState('stats', false);
    }
  }, [loadingStates.stats, updateLoadingState]);

  // Initial load - only users and stats
  useEffect(() => {
    console.log('📊 ActivityLogViewer - Initial effect triggered');
    fetchUsers();
    fetchStats();
  }, []); // No dependencies to prevent loops

  // Load logs when users are available
  useEffect(() => {
    console.log('📊 ActivityLogViewer - Users dependency effect triggered:', { usersLength: users.length });
    if (users.length > 0) {
      fetchLogs(true);
    }
  }, [users.length]); // Only depend on users length

  // Debounced search effect
  useEffect(() => {
    console.log('📊 ActivityLogViewer - Search effect triggered:', { searchTerm });
    if (searchDebounce) {
      clearTimeout(searchDebounce);
    }
    
    const timeout = setTimeout(() => {
      console.log('📊 ActivityLogViewer - Search timeout triggered');
      if (users.length > 0) {
        fetchLogs(true);
      }
    }, 500);
    
    setSearchDebounce(timeout);
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [searchTerm]); // Only search term

  // Filter change effect
  useEffect(() => {
    console.log('📊 ActivityLogViewer - Filter effect triggered:', { activityTypeFilter, userIdFilter });
    if (users.length > 0) {
      fetchLogs(true);
    }
  }, [activityTypeFilter, userIdFilter]); // Only filters

  const getActivityTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      login: 'bg-green-100 text-green-800',
      logout: 'bg-gray-100 text-gray-800',
      registration: 'bg-blue-100 text-blue-800',
      video_watched: 'bg-purple-100 text-purple-800',
      video_completed: 'bg-purple-100 text-purple-800',
      game_unlocked: 'bg-yellow-100 text-yellow-800',
      coins_earned: 'bg-green-100 text-green-800',
      coins_spent: 'bg-red-100 text-red-800',
      minesweeper_played: 'bg-indigo-100 text-indigo-800',
      admin_action: 'bg-orange-100 text-orange-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const formatActivityType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const handleRefresh = () => {
    console.log('📊 ActivityLogViewer - Manual refresh triggered');
    updateLoadingState('refreshing', true);
    fetchUsers();
    fetchStats();
    setTimeout(() => updateLoadingState('refreshing', false), 1000);
  };

  const handleRetry = () => {
    console.log('📊 ActivityLogViewer - Retry triggered');
    setError(null);
    fetchLogs(true);
  };

  const isAnyLoading = Object.values(loadingStates).some(Boolean);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Activities (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.values(stats).reduce((sum, count) => sum + count, 0)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Logins (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.login || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Videos Watched (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{(stats.video_watched || 0) + (stats.video_completed || 0)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Games Unlocked (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.game_unlocked || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Logs
            {isAnyLoading && (
              <div className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                Loading...
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search activities or usernames..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  disabled={isAnyLoading}
                />
              </div>
            </div>
            
            <Select value={activityTypeFilter} onValueChange={setActivityTypeFilter} disabled={isAnyLoading}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Activity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="logout">Logout</SelectItem>
                <SelectItem value="registration">Registration</SelectItem>
                <SelectItem value="video_watched">Video Watched</SelectItem>
                <SelectItem value="video_completed">Video Completed</SelectItem>
                <SelectItem value="game_unlocked">Game Unlocked</SelectItem>
                <SelectItem value="coins_earned">Coins Earned</SelectItem>
                <SelectItem value="coins_spent">Coins Spent</SelectItem>
                <SelectItem value="minesweeper_played">Minesweeper</SelectItem>
                <SelectItem value="admin_action">Admin Action</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="User ID filter..."
              value={userIdFilter}
              onChange={(e) => setUserIdFilter(e.target.value)}
              className="w-[200px]"
              disabled={isAnyLoading}
            />
            
            <Button
              onClick={handleRefresh}
              disabled={isAnyLoading}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loadingStates.refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Debug Information */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
              <div>Debug Info:</div>
              <div>Users loaded: {users.length}</div>
              <div>Logs loaded: {logs.length}</div>
              <div>Loading states: {JSON.stringify(loadingStates)}</div>
              <div>Has error: {!!error}</div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-800">Error Loading Activity Logs</span>
              </div>
              <p className="text-red-700 text-sm mb-3">{error}</p>
              <Button onClick={handleRetry} size="sm" variant="outline">
                Try Again
              </Button>
            </div>
          )}

          {/* Activity Log List */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {loadingStates.logs ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading activity logs...</p>
              </div>
            ) : logs.length === 0 && !error ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No activities found</p>
                <p className="text-sm text-gray-500 mt-1">
                  Users: {users.length} | Filters active: {activityTypeFilter || userIdFilter || searchTerm ? 'Yes' : 'No'}
                </p>
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getActivityTypeColor(log.activity_type)}>
                        {formatActivityType(log.activity_type)}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss')}
                      </span>
                      {log.username && (
                        <Badge variant="outline" className="text-xs">
                          {log.username}
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-900 mb-1">{log.description}</p>
                    {log.user_id && (
                      <p className="text-xs text-gray-500">User ID: {log.user_id}</p>
                    )}
                    {log.metadata && typeof log.metadata === 'object' && log.metadata !== null && Object.keys(log.metadata).length > 0 && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                          View metadata
                        </summary>
                        <pre className="text-xs text-gray-600 mt-1 p-2 bg-gray-100 rounded overflow-x-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityLogViewer;
