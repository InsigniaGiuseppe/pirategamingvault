
import { supabase } from '@/integrations/supabase/client';

export interface ActivityLogEntry {
  user_id?: string;
  activity_type: string;
  description: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

export type ActivityType = 
  | 'login'
  | 'logout'
  | 'video_watched'
  | 'video_completed'
  | 'game_unlocked'
  | 'coins_earned'
  | 'coins_spent'
  | 'minesweeper_played'
  | 'admin_action'
  | 'registration';

class ActivityLoggingService {
  private async getClientInfo() {
    const info = {
      user_agent: navigator.userAgent,
      // Note: Getting real IP requires server-side implementation
      // For now, we'll just track user agent
    };
    console.log('📝 ActivityLoggingService - Client info:', info);
    return info;
  }

  async logActivity(
    userId: string | null,
    activityType: ActivityType,
    description: string,
    metadata: Record<string, any> = {}
  ) {
    try {
      console.log('📝 ActivityLoggingService - Starting to log activity:', {
        userId,
        activityType,
        description,
        metadata
      });

      const clientInfo = await this.getClientInfo();
      
      const logEntry: ActivityLogEntry = {
        user_id: userId || undefined,
        activity_type: activityType,
        description,
        metadata,
        user_agent: clientInfo.user_agent,
      };

      console.log('📝 ActivityLoggingService - Prepared log entry:', logEntry);

      const { error, data } = await supabase
        .from('activity_logs')
        .insert([logEntry])
        .select();

      if (error) {
        console.error('📝 ActivityLoggingService - Failed to log activity:', error);
        console.error('📝 ActivityLoggingService - Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
      } else {
        console.log('📝 ActivityLoggingService - Activity logged successfully:', data);
      }
    } catch (error) {
      console.error('📝 ActivityLoggingService - Error logging activity:', error);
    }
  }

  // Convenience methods for common activities
  async logLogin(userId: string, username: string) {
    console.log('📝 ActivityLoggingService - Logging login for:', { userId, username });
    await this.logActivity(userId, 'login', `User ${username} logged in`, {
      username,
      timestamp: new Date().toISOString()
    });
  }

  async logLogout(userId: string, username: string) {
    console.log('📝 ActivityLoggingService - Logging logout for:', { userId, username });
    await this.logActivity(userId, 'logout', `User ${username} logged out`, {
      username,
      timestamp: new Date().toISOString()
    });
  }

  async logRegistration(userId: string, username: string) {
    console.log('📝 ActivityLoggingService - Logging registration for:', { userId, username });
    await this.logActivity(userId, 'registration', `New user ${username} registered`, {
      username,
      timestamp: new Date().toISOString()
    });
  }

  async logVideoWatched(userId: string, videoId: string, videoTitle: string) {
    console.log('📝 ActivityLoggingService - Logging video watched:', { userId, videoId, videoTitle });
    await this.logActivity(userId, 'video_watched', `Started watching "${videoTitle}"`, {
      video_id: videoId,
      video_title: videoTitle,
      timestamp: new Date().toISOString()
    });
  }

  async logVideoCompleted(userId: string, videoId: string, videoTitle: string, rewardAmount: number) {
    console.log('📝 ActivityLoggingService - Logging video completed:', { userId, videoId, videoTitle, rewardAmount });
    await this.logActivity(userId, 'video_completed', `Completed video "${videoTitle}" and earned ${rewardAmount} coins`, {
      video_id: videoId,
      video_title: videoTitle,
      reward_amount: rewardAmount,
      timestamp: new Date().toISOString()
    });
  }

  async logGameUnlocked(userId: string, gameId: string, gameTitle: string, cost: number) {
    console.log('📝 ActivityLoggingService - Logging game unlocked:', { userId, gameId, gameTitle, cost });
    await this.logActivity(userId, 'game_unlocked', `Unlocked game "${gameTitle}" for ${cost} coins`, {
      game_id: gameId,
      game_title: gameTitle,
      cost,
      timestamp: new Date().toISOString()
    });
  }

  async logCoinsEarned(userId: string, amount: number, source: string, description?: string) {
    console.log('📝 ActivityLoggingService - Logging coins earned:', { userId, amount, source, description });
    await this.logActivity(userId, 'coins_earned', description || `Earned ${amount} coins from ${source}`, {
      amount,
      source,
      timestamp: new Date().toISOString()
    });
  }

  async logCoinsSpent(userId: string, amount: number, purpose: string, description?: string) {
    console.log('📝 ActivityLoggingService - Logging coins spent:', { userId, amount, purpose, description });
    await this.logActivity(userId, 'coins_spent', description || `Spent ${amount} coins on ${purpose}`, {
      amount,
      purpose,
      timestamp: new Date().toISOString()
    });
  }

  async logMinesweeperGame(userId: string, difficulty: string, won: boolean, timeElapsed: number, coinsEarned: number) {
    console.log('📝 ActivityLoggingService - Logging minesweeper game:', { userId, difficulty, won, timeElapsed, coinsEarned });
    await this.logActivity(userId, 'minesweeper_played', `Played Minesweeper (${difficulty}) - ${won ? 'Won' : 'Lost'} in ${timeElapsed}s, earned ${coinsEarned} coins`, {
      difficulty,
      won,
      time_elapsed: timeElapsed,
      coins_earned: coinsEarned,
      timestamp: new Date().toISOString()
    });
  }

  async logAdminAction(adminUserId: string, action: string, targetUserId?: string, details?: Record<string, any>) {
    console.log('📝 ActivityLoggingService - Logging admin action:', { adminUserId, action, targetUserId, details });
    await this.logActivity(adminUserId, 'admin_action', `Admin action: ${action}`, {
      action,
      target_user_id: targetUserId,
      details,
      timestamp: new Date().toISOString()
    });
  }

  // Method to fetch activity logs for admin dashboard
  async getActivityLogs(limit = 100, offset = 0, filters?: {
    userId?: string;
    activityType?: string;
    startDate?: string;
    endDate?: string;
  }) {
    try {
      console.log('📝 ActivityLoggingService - Fetching activity logs:', { limit, offset, filters });

      let query = supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (filters?.userId) {
        console.log('📝 ActivityLoggingService - Adding userId filter:', filters.userId);
        query = query.eq('user_id', filters.userId);
      }

      if (filters?.activityType) {
        console.log('📝 ActivityLoggingService - Adding activityType filter:', filters.activityType);
        query = query.eq('activity_type', filters.activityType);
      }

      if (filters?.startDate) {
        console.log('📝 ActivityLoggingService - Adding startDate filter:', filters.startDate);
        query = query.gte('created_at', filters.startDate);
      }

      if (filters?.endDate) {
        console.log('📝 ActivityLoggingService - Adding endDate filter:', filters.endDate);
        query = query.lte('created_at', filters.endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('📝 ActivityLoggingService - Error fetching activity logs:', error);
        console.error('📝 ActivityLoggingService - Query error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        return { logs: [], error };
      }

      console.log('📝 ActivityLoggingService - Activity logs fetched successfully:', {
        count: data?.length || 0,
        sample: data?.slice(0, 3).map(log => ({
          id: log.id,
          activity_type: log.activity_type,
          created_at: log.created_at,
          description: log.description?.substring(0, 50)
        }))
      });

      return { logs: data || [], error: null };
    } catch (error) {
      console.error('📝 ActivityLoggingService - Error fetching activity logs:', error);
      return { logs: [], error };
    }
  }

  // Method to get activity statistics
  async getActivityStats() {
    try {
      console.log('📝 ActivityLoggingService - Fetching activity stats');
      
      const { data, error } = await supabase
        .from('activity_logs')
        .select('activity_type')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Last 24 hours

      if (error) {
        console.error('📝 ActivityLoggingService - Error fetching activity stats:', error);
        console.error('📝 ActivityLoggingService - Stats error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        return {};
      }

      const stats = data?.reduce((acc, log) => {
        acc[log.activity_type] = (acc[log.activity_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      console.log('📝 ActivityLoggingService - Activity stats calculated:', stats);
      return stats;
    } catch (error) {
      console.error('📝 ActivityLoggingService - Error fetching activity stats:', error);
      return {};
    }
  }
}

export const activityLogger = new ActivityLoggingService();
