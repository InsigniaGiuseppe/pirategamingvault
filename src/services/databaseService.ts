
import { supabase } from '@/integrations/supabase/client';

export class DatabaseService {
  static async validateUserExists(userId: string): Promise<boolean> {
    try {
      // Check if user exists in either profiles or custom_users
      const [profileResult, customUserResult] = await Promise.all([
        supabase.from('profiles').select('id').eq('id', userId).maybeSingle(),
        supabase.from('custom_users').select('id').eq('id', userId).maybeSingle()
      ]);
      
      return !!(profileResult.data || customUserResult.data);
    } catch (error) {
      console.error('Error validating user existence:', error);
      return false;
    }
  }

  static async ensureUserBalance(userId: string): Promise<boolean> {
    try {
      const { data: existingBalance } = await supabase
        .from('user_balance')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (!existingBalance) {
        const { error } = await supabase
          .from('user_balance')
          .upsert(
            { user_id: userId, balance: 0 },
            { onConflict: 'user_id', ignoreDuplicates: false }
          );
        
        if (error) {
          console.error('Error creating user balance:', error);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error ensuring user balance:', error);
      return false;
    }
  }

  static async safeExecuteRPC(
    rpcFunction: 'add_coins' | 'remove_coins',
    params: any,
    timeoutMs: number = 15000
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate user exists first
      const userExists = await this.validateUserExists(params.user_id);
      if (!userExists) {
        return { success: false, error: 'User not found in database' };
      }

      // Ensure user balance record exists
      const balanceExists = await this.ensureUserBalance(params.user_id);
      if (!balanceExists) {
        return { success: false, error: 'Failed to ensure user balance record' };
      }

      // Execute RPC with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const { data, error } = await supabase.rpc(rpcFunction, params);
        clearTimeout(timeoutId);

        if (error) {
          return { success: false, error: error.message };
        }

        return { success: true };
      } catch (rpcError: any) {
        clearTimeout(timeoutId);
        
        if (rpcError.name === 'AbortError') {
          return { success: false, error: 'Operation timed out' };
        }
        
        return { success: false, error: rpcError.message || 'Unknown RPC error' };
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error' };
    }
  }
}
