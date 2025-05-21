
import { supabase } from "@/integrations/supabase/client";
import { createTransaction } from "./transactionService";

// Update user balance in database
export const updateUserBalance = async (
  userId: string, 
  amount: number, 
  description: string = '', 
  type: 'earn' | 'spend' | 'admin' = 'earn'
): Promise<boolean> => {
  try {
    // Create a transaction for the balance update
    const transactionSuccess = await createTransaction(userId, amount, description, type);
    
    if (!transactionSuccess) {
      console.error('Failed to create transaction for balance update');
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

// Get user balance from database
export const getUserBalance = async (userId: string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('user_balance')
      .select('balance')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error || !data) {
      console.error('Error getting user balance:', error);
      return 0;
    }
    
    return data.balance || 0;
  } catch (error) {
    console.error('Unexpected error in getUserBalance:', error);
    return 0;
  }
};
