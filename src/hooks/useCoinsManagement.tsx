
import { useContext } from 'react';
import { updateUserBalance, getUserTransactions } from '@/services/userService';
import { AuthStateContext } from './useAuthState';

export const useCoinsManagement = () => {
  const context = useContext(AuthStateContext);
  const { userId, pirateCoins } = context;
  
  const setState = 'setState' in context ? context.setState : undefined;
  
  const addPirateCoins = async (amount: number, description: string = '') => {
    if (!userId) return;
    
    const transactionType: 'earn' | 'spend' | 'admin' = 
      amount > 0 
        ? (description.includes('admin') ? 'admin' : 'earn') 
        : 'spend';
    
    // Update balance in Supabase
    const success = await updateUserBalance(userId, amount, description, transactionType);
    
    if (success && setState) {
      // Update local state
      const newTotal = Math.max(0, pirateCoins + amount);
      
      // Get updated transactions list
      const updatedTransactions = await getUserTransactions(userId);
      
      setState(prev => ({
        ...prev,
        pirateCoins: newTotal,
        transactions: updatedTransactions
      }));
    }
  };
  
  return { addPirateCoins };
};
