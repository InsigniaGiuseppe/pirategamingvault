
import { supabase } from "@/integrations/supabase/client";

export interface DatabaseUser {
  id: string;
  username: string;
  created_at: string;
  balance: number;
  transactions: any[];
}

// Get all users from database with their balance and transaction info
export const getAllDatabaseUsers = async (): Promise<DatabaseUser[]> => {
  try {
    console.log('Fetching all database users...');
    
    // Get all users from custom_users table
    const { data: users, error: usersError } = await supabase
      .from('custom_users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      return [];
    }
    
    if (!users || users.length === 0) {
      console.log('No users found in database');
      return [];
    }
    
    // Get balances for all users
    const { data: balances, error: balanceError } = await supabase
      .from('user_balance')
      .select('*');
    
    if (balanceError) {
      console.error('Error fetching balances:', balanceError);
    }
    
    // Get transactions for all users
    const { data: transactions, error: transactionError } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (transactionError) {
      console.error('Error fetching transactions:', transactionError);
    }
    
    // Combine user data with balance and transactions
    const databaseUsers: DatabaseUser[] = users.map(user => {
      const userBalance = balances?.find(b => b.user_id === user.id);
      const userTransactions = transactions?.filter(t => t.user_id === user.id) || [];
      
      return {
        id: user.id,
        username: user.username,
        created_at: user.created_at,
        balance: userBalance?.balance || 10, // Default to 10 if no balance found
        transactions: userTransactions.map(tx => ({
          id: tx.id,
          timestamp: new Date(tx.created_at).getTime(),
          amount: tx.amount,
          description: tx.description || '',
          type: tx.type
        }))
      };
    });
    
    console.log('Database users loaded:', databaseUsers.length);
    return databaseUsers;
    
  } catch (error) {
    console.error('Error in getAllDatabaseUsers:', error);
    return [];
  }
};

// Update user balance in database
export const updateDatabaseUserBalance = async (
  userId: string,
  amount: number,
  description: string,
  type: 'earn' | 'spend' | 'admin' = 'admin'
): Promise<boolean> => {
  try {
    console.log('Updating database user balance:', userId, amount);
    
    // Get current balance
    const { data: currentBalance, error: balanceError } = await supabase
      .from('user_balance')
      .select('balance')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (balanceError) {
      console.error('Error getting current balance:', balanceError);
      return false;
    }
    
    const newBalance = Math.max(0, (currentBalance?.balance || 0) + amount);
    
    // Update balance
    const { error: updateError } = await supabase
      .from('user_balance')
      .upsert({
        user_id: userId,
        balance: newBalance,
        updated_at: new Date().toISOString()
      });
    
    if (updateError) {
      console.error('Error updating balance:', updateError);
      return false;
    }
    
    // Add transaction record
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        amount,
        description,
        type
      });
    
    if (transactionError) {
      console.error('Error creating transaction:', transactionError);
      return false;
    }
    
    console.log('Database user balance updated successfully');
    return true;
    
  } catch (error) {
    console.error('Error in updateDatabaseUserBalance:', error);
    return false;
  }
};
