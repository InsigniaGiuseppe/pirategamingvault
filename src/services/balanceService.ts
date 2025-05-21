
import { supabase } from "@/integrations/supabase/client";
import { Transaction } from "./transactionService";

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
