
import { supabase } from "@/integrations/supabase/client";

export interface Transaction {
  id: string;
  timestamp: number;
  amount: number;
  description: string;
  type: 'earn' | 'spend' | 'admin';
}

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
