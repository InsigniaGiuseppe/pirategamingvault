
import { supabase } from "@/integrations/supabase/client";

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
      console.error('Error fetching balance:', error);
      return 0;
    }
    
    return data?.balance || 0;
  } catch (error) {
    console.error('Unexpected error in getUserBalance:', error);
    return 0;
  }
};

// Add to user balance
export const addToUserBalance = async (userId: string, amount: number): Promise<boolean> => {
  try {
    // First get current balance
    const currentBalance = await getUserBalance(userId);
    const newBalance = currentBalance + amount;
    
    const { error } = await supabase
      .from('user_balance')
      .update({ balance: newBalance })
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error updating balance:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error in addToUserBalance:', error);
    return false;
  }
};

// Subtract from user balance
export const subtractFromUserBalance = async (userId: string, amount: number): Promise<boolean> => {
  try {
    // First get current balance
    const currentBalance = await getUserBalance(userId);
    
    // Check if user has enough balance
    if (currentBalance < amount) {
      return false;
    }
    
    const newBalance = currentBalance - amount;
    
    const { error } = await supabase
      .from('user_balance')
      .update({ balance: newBalance })
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error updating balance:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error in subtractFromUserBalance:', error);
    return false;
  }
};
