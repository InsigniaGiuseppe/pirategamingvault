
import { supabase } from "@/integrations/supabase/client";
import { Credential } from "./credentialService"; // Reusing the Credential type

export interface Transaction {
  id: string;
  timestamp: number;
  amount: number;
  description: string;
  type: 'earn' | 'spend' | 'admin';
}

// Register a new user
export const registerUser = async (username: string, password: string, authCode: string = '010101!'): Promise<Credential | null> => {
  // Insert the user credentials
  const { data: credentialData, error: credentialError } = await supabase
    .from('credentials')
    .insert({
      username,
      password, 
      auth_code: authCode,
      active: true
    })
    .select()
    .single();
  
  if (credentialError) {
    console.error('Error registering user:', credentialError);
    return null;
  }
  
  // Initialize user balance with 10 coins
  const { error: balanceError } = await supabase
    .from('user_balance')
    .insert({
      user_id: username,
      balance: 10
    });
  
  if (balanceError) {
    console.error('Error initializing user balance:', balanceError);
    // In a real app, we would handle this error more gracefully
  }
  
  // Create initial welcome transaction
  const { error: transactionError } = await supabase
    .from('transactions')
    .insert({
      user_id: username,
      amount: 10,
      description: 'Welcome bonus',
      type: 'admin'
    });
  
  if (transactionError) {
    console.error('Error creating welcome transaction:', transactionError);
  }
  
  // Format the response to match our existing Credential interface
  return {
    id: credentialData.id,
    username: credentialData.username,
    password: credentialData.password,
    authCode: credentialData.auth_code,
    active: credentialData.active,
    createdAt: credentialData.created_at
  };
};

// Verify user credentials
export const verifyCredentials = async (username: string, password: string): Promise<Credential | null> => {
  const { data, error } = await supabase
    .from('credentials')
    .select('*')
    .eq('username', username)
    .eq('password', password)
    .eq('active', true)
    .single();
  
  if (error || !data) {
    console.error('Error verifying credentials:', error);
    return null;
  }
  
  return {
    id: data.id,
    username: data.username,
    password: data.password,
    authCode: data.auth_code,
    active: data.active,
    createdAt: data.created_at
  };
};

// Get user's coin balance
export const getUserBalance = async (userId: string): Promise<number> => {
  const { data, error } = await supabase
    .from('user_balance')
    .select('balance')
    .eq('user_id', userId)
    .single();
  
  if (error || !data) {
    console.error('Error getting user balance:', error);
    return 0;
  }
  
  return data.balance;
};

// Update user's coin balance
export const updateUserBalance = async (
  userId: string, 
  amount: number, 
  description: string = '',
  type: 'earn' | 'spend' | 'admin' = 'earn'
): Promise<boolean> => {
  // Get current balance
  const { data: currentBalance, error: balanceError } = await supabase
    .from('user_balance')
    .select('balance')
    .eq('user_id', userId)
    .single();
  
  if (balanceError) {
    // If no balance record exists, create one
    if (balanceError.code === 'PGRST116') {
      const { error: insertError } = await supabase
        .from('user_balance')
        .insert({
          user_id: userId,
          balance: Math.max(0, amount) // Ensure we don't go negative for new users
        });
      
      if (insertError) {
        console.error('Error creating user balance:', insertError);
        return false;
      }
    } else {
      console.error('Error getting user balance:', balanceError);
      return false;
    }
  }
  
  const newBalance = Math.max(0, (currentBalance?.balance || 0) + amount);
  
  // Update the balance
  const { error: updateError } = await supabase
    .from('user_balance')
    .update({ balance: newBalance })
    .eq('user_id', userId);
  
  if (updateError) {
    console.error('Error updating user balance:', updateError);
    return false;
  }
  
  // Add transaction record
  const { error: transactionError } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      amount,
      description: description || (amount > 0 ? 'Earned coins' : 'Spent coins'),
      type
    });
  
  if (transactionError) {
    console.error('Error creating transaction record:', transactionError);
    // In a real app, we would handle this error more gracefully
  }
  
  return true;
};

// Get user's transaction history
export const getUserTransactions = async (userId: string): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error getting user transactions:', error);
    return [];
  }
  
  return data.map(tx => ({
    id: tx.id,
    timestamp: new Date(tx.created_at).getTime(),
    amount: tx.amount,
    description: tx.description || '',
    type: tx.type as 'earn' | 'spend' | 'admin'
  }));
};

// Get user's unlocked games
export const getUserUnlockedGames = async (userId: string): Promise<string[]> => {
  // First 4 games are always unlocked
  const defaultUnlocked = ['1', '2', '3', '4'];
  
  const { data, error } = await supabase
    .from('unlocked_games')
    .select('game_id')
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error getting unlocked games:', error);
    return defaultUnlocked;
  }
  
  const unlockedIds = data.map(item => item.game_id);
  return [...new Set([...defaultUnlocked, ...unlockedIds])];
};
