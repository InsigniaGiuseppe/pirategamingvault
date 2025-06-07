
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
    return {
      user_agent: navigator.userAgent,
      // Note: Getting real IP requires server-side implementation
      // For now, we'll just track user agent
    };
  }

  async logActivity(
    userId: string | null,
    activityType: ActivityType,
    description: string,
    metadata: Record<string, any> = {}
  ) {
    try {
      const clientInfo = await this.getClientInfo();
      
      const logEntry: ActivityLogEntry = {
        user_id: userId || undefined,
        activity_type: activityType,
        description,
        metadata,
        user_agent: clientInfo.user_agent,
      };

      const { error } = await supabase
        .from('activity_logs')
        .insert([logEntry]);

      if (error) {
        console.error('Failed to log activity:', error);
      }
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  // Convenience methods for common activities
  async logLogin(userId: string, username: string) {
    await this.logActivity(userId, 'login', `User ${username} logged in`, {
      username,
      timestamp: new Date().toISOString()
    });
  }

  async logLogout(userId: string, username: string) {
    await this.logActivity(userId, 'logout', `User ${username} logged out`, {
      username,
      timestamp: new Date().toISOString()
    });
  }

  async logRegistration(userId: string, username: string) {
    await this.logActivity(userId, 'registration', `New user ${username} registered`, {
      username,
      timestamp: new Date().toISOString()
    });
  }

  async logVideoWatched(userId: string, videoId: string, videoTitle: string) {
    await this.logActivity(userId, 'video_watched', `Started watching "${videoTitle}"`, {
      video_id: videoId,
      video_title: videoTitle,
      timestamp: new Date().toISOString()
    });
  }

  async logVideoCompleted(userId: string, videoId: string, videoTitle: string, rewardAmount: number) {
    await this.logActivity(userId, 'video_completed', `Completed video "${videoTitle}" and earned ${rewardAmount} coins`, {
      video_id: videoId,
      video_title: videoTitle,
      reward_amount: rewardAmount,
      timestamp: new Date().toISOString()
    });
  }

  async logGameUnlocked(userId: string, gameId: string, gameTitle: string, cost: number) {
    await this.logActivity(userId, 'game_unlocked', `Unlocked game "${gameTitle}" for ${cost} coins`, {
      game_id: gameId,
      game_title: gameTitle,
      cost,
      timestamp: new Date().toISOString()
    });
  }

  async logCoinsEarned(userId: string, amount: number, source: string, description?: string) {
    await this.logActivity(userId, 'coins_earned', description || `Earned ${amount} coins from ${source}`, {
      amount,
      source,
      timestamp: new Date().toISOString()
    });
  }

  async logCoinsSpent(userId: string, amount: number, purpose: string, description?: string) {
    await this.logActivity(userId, 'coins_spent', description || `Spent ${amount} coins on ${purpose}`, {
      amount,
      purpose,
      timestamp: new Date().toISOString()
    });
  }

  async logMinesweeperGame(userId: string, difficulty: string, won: boolean, timeElapsed: number, coinsEarned: number) {
    await this.logActivity(userId, 'minesweeper_played', `Played Minesweeper (${difficulty}) - ${won ? 'Won' : 'Lost'} in ${timeElapsed}s, earned ${coinsEarned} coins`, {
      difficulty,
      won,
      time_elapsed: timeElapsed,
      coins_earned: coinsEarned,
      timestamp: new Date().toISOString()
    });
  }

  async logAdminAction(adminUserId: string, action: string, targetUserId?: string, details?: Record<string, any>) {
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
      let query = supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters?.activityType) {
        query = query.eq('activity_type', filters.activityType);
      }

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching activity logs:', error);
        return { logs: [], error };
      }

      return { logs: data || [], error: null };
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      return { logs: [], error };
    }
  }

  // Method to get activity statistics
  async getActivityStats() {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('activity_type')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Last 24 hours

      if (error) {
        console.error('Error fetching activity stats:', error);
        return {};
      }

      const stats = data?.reduce((acc, log) => {
        acc[log.activity_type] = (acc[log.activity_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return stats;
    } catch (error) {
      console.error('Error fetching activity stats:', error);
      return {};
    }
  }
}

export const activityLogger = new ActivityLoggingService();
