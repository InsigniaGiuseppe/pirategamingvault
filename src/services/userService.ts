
import { supabase } from "@/integrations/supabase/client";

export interface Transaction {
  id: string;
  timestamp: number;
  amount: number;
  description: string;
  type: 'earn' | 'spend' | 'admin';
}

// Get user balance from database
export const getUserBalance = async (userId: string): Promise<number> => {
  try {
    console.log('Getting balance for user:', userId);
    
    const { data, error } = await supabase
      .from('user_balance')
      .select('balance')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error getting user balance:', error);
      return 10; // Default fallback balance
    }
    
    return data?.balance || 10;
  } catch (error) {
    console.error('Unexpected error in getUserBalance:', error);
    return 10; // Default fallback balance
  }
};

// Get user transactions from database
export const getUserTransactions = async (userId: string): Promise<Transaction[]> => {
  try {
    console.log('Getting transactions for user:', userId);
    
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching transactions:', error);
      return [
        {
          id: 'welcome-1',
          timestamp: Date.now(),
          amount: 10,
          description: 'Welcome bonus',
          type: 'admin'
        }
      ];
    }
    
    // Transform database records to Transaction interface
    return (data || []).map(record => ({
      id: record.id,
      timestamp: new Date(record.created_at).getTime(),
      amount: record.amount,
      description: record.description || '',
      type: record.type as 'earn' | 'spend' | 'admin'
    }));
  } catch (error) {
    console.error('Unexpected error in getUserTransactions:', error);
    return [
      {
        id: 'welcome-1',
        timestamp: Date.now(),
        amount: 10,
        description: 'Welcome bonus',
        type: 'admin'
      }
    ];
  }
};

// Get user unlocked games from database
export const getUserUnlockedGames = async (userId: string): Promise<string[]> => {
  try {
    console.log('Getting unlocked games for user:', userId);
    
    const { data, error } = await supabase
      .from('unlocked_games')
      .select('game_id')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching unlocked games:', error);
      return [];
    }
    
    return (data || []).map(record => record.game_id);
  } catch (error) {
    console.error('Unexpected error in getUserUnlockedGames:', error);
    return [];
  }
};

// Update user balance in database
export const updateUserBalance = async (
  userId: string, 
  amount: number, 
  description: string = '', 
  type: 'earn' | 'spend' | 'admin' = 'earn'
): Promise<boolean> => {
  try {
    console.log('Updating balance for user:', userId, 'amount:', amount);
    
    // Create a transaction record first
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert([{
        user_id: userId,
        amount,
        description,
        type: type as any
      }]);
    
    if (transactionError) {
      console.error('Error creating transaction:', transactionError);
      return false;
    }
    
    // Get current balance
    const { data: currentData, error: balanceError } = await supabase
      .from('user_balance')
      .select('balance')
      .eq('user_id', userId)
      .maybeSingle();
    
    // If user doesn't have a balance entry yet, create one
    if (!currentData) {
      const { error: insertError } = await supabase
        .from('user_balance')
        .insert([{
          user_id: userId,
          balance: Math.max(0, amount) // Ensure balance doesn't go negative on first entry
        }]);
      
      if (insertError) {
        console.error('Error creating initial balance:', insertError);
        return false;
      }
      
      return true;
    }
    
    // Calculate new balance, ensuring it's not negative
    const currentBalance = currentData.balance || 0;
    const newBalance = Math.max(0, currentBalance + amount);
    
    // Update balance in database
    const { error: updateError } = await supabase
      .from('user_balance')
      .update({ 
        balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
    
    if (updateError) {
      console.error('Error updating balance:', updateError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error in updateUserBalance:', error);
    return false;
  }
};
