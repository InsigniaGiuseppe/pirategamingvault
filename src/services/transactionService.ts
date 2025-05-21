
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuid } from "uuid";

interface Transaction {
  id: string;
  timestamp: number;
  amount: number;
  description: string;
  type: 'earn' | 'spend' | 'admin';
}

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
      return [];
    }
    
    // Transform database records to Transaction interface with type casting to ensure type safety
    return (data || []).map(record => ({
      id: record.id || uuid(),
      timestamp: new Date(record.created_at).getTime(),
      amount: record.amount,
      description: record.description || '',
      // Cast the type to the specific union type we want
      type: record.type as 'earn' | 'spend' | 'admin'
    }));
  } catch (error) {
    console.error('Unexpected error in getUserTransactions:', error);
    return [];
  }
};

// Create a new transaction
export const createTransaction = async (
  userId: string, 
  amount: number, 
  description: string, 
  type: 'earn' | 'spend' | 'admin'
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('transactions')
      .insert([{
        user_id: userId,
        amount,
        description,
        type
      }]);
    
    if (error) {
      console.error('Error creating transaction:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error in createTransaction:', error);
    return false;
  }
};
