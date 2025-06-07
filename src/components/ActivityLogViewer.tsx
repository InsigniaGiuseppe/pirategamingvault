
import { useState, useEffect, useCallback, useRef } from 'react';
import { activityLogger } from '@/services/activityLoggingService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Search, Filter, Activity, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface ActivityLog {
  id: string;
  user_id: string;
  activity_type: string;
  description: string;
  metadata: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

const ActivityLogViewer = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [activityTypeFilter, setActivityTypeFilter] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Refs for cleanup and request management
  const abortControllerRef = useRef<AbortController | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchLogs = useCallback(async () => {
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);
    
    try {
      const filters = {
        ...(activityTypeFilter && { activityType: activityTypeFilter }),
        ...(userIdFilter && { userId: userIdFilter }),
      };

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 10000);
      });

      const fetchPromise = activityLogger.getActivityLogs(100, 0, filters);
      
      const { logs: fetchedLogs } = await Promise.race([fetchPromise, timeoutPromise]) as any;
      
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }
      
      // Filter by search term if provided
      const filteredLogs = searchTerm 
        ? fetchedLogs.filter((log: ActivityLog) => 
            log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.activity_type.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : fetchedLogs;

      setLogs(filteredLogs);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return; // Request was cancelled, ignore
      }
      
      console.error('Error fetching activity logs:', error);
      setError(error.message === 'Request timeout' ? 'Request timed out. Please try again.' : 'Failed to load activity logs.');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [activityTypeFilter, userIdFilter, searchTerm]);

  const fetchStats = useCallback(async () => {
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Stats timeout')), 5000);
      });

      const statsPromise = activityLogger.getActivityStats();
      const fetchedStats = await Promise.race([statsPromise, timeoutPromise]);
      
      setStats(fetchedStats as Record<string, number>);
    } catch (error) {
      console.error('Error fetching activity stats:', error);
      // Don't show error for stats, just use empty stats
      setStats({});
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchLogs();
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, fetchLogs]);

  // Fetch logs and stats on filter changes
  useEffect(() => {
    fetchLogs();
  }, [activityTypeFilter, userIdFilter]);

  // Initial data fetch
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

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
    fetchLogs();
    fetchStats();
  };

  const handleRetry = () => {
    setError(null);
    fetchLogs();
  };

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
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={activityTypeFilter} onValueChange={setActivityTypeFilter}>
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
            />
            
            <Button
              onClick={handleRefresh}
              disabled={loading}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

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
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading activity logs...</p>
              </div>
            ) : logs.length === 0 && !error ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No activities found</p>
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
                    </div>
                    <p className="text-gray-900 mb-1">{log.description}</p>
                    {log.user_id && (
                      <p className="text-xs text-gray-500">User ID: {log.user_id}</p>
                    )}
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
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
