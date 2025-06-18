
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Activity, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface ActivityLog {
  id: string;
  activity_type: string;
  description: string;
  created_at: string;
  user_id: string | null;
  ip_address: string | null;
  metadata: any;
}

const SimpleActivityLogViewer = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Fetching activity logs...');
      
      const { data, error: fetchError } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (fetchError) {
        console.error('❌ Error fetching activity logs:', fetchError);
        setError(fetchError.message);
        return;
      }
      
      console.log('✅ Activity logs fetched:', data?.length || 0);
      setLogs(data || []);
    } catch (err) {
      console.error('❌ Unexpected error:', err);
      setError('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case 'login':
        return '🔑';
      case 'logout':
        return '🚪';
      case 'registration':
        return '📝';
      case 'game_unlock':
        return '🎮';
      case 'coins_earned':
        return '💰';
      default:
        return '📋';
    }
  };

  const getActivityTypeBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      login: "default",
      logout: "secondary",
      registration: "default",
      game_unlock: "outline",
      coins_earned: "secondary"
    };
    return variants[type] || "outline";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Logs
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLogs}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Load Logs'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}
        
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Skeleton className="h-8 w-8 rounded" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No activity logs found</p>
              <p className="text-sm mt-2">Click "Load Logs" to fetch recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                  <div className="text-2xl">
                    {getActivityTypeIcon(log.activity_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{log.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {format(new Date(log.created_at), 'MMM dd, HH:mm:ss')}
                      </span>
                      {log.user_id && (
                        <span className="text-xs text-gray-400">
                          User: {log.user_id.slice(0, 8)}...
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge variant={getActivityTypeBadge(log.activity_type)}>
                    {log.activity_type}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default SimpleActivityLogViewer;
