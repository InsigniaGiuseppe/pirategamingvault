
import { useCallback } from 'react';
import { getUserBalance, getUserTransactions, getUserUnlockedGames } from '@/services/userService';
import type { AuthState } from './types';

export const useAuthData = () => {
  const loadUserData = useCallback(async (
    userId: string,
    safeSetState: (updater: (prev: AuthState) => AuthState) => void,
    mountedRef: React.MutableRefObject<boolean>
  ) => {
    if (!mountedRef.current) return;
    
    try {
      console.log('🔐 Loading user data for:', userId);
      
      const [balance, transactions, unlockedGames] = await Promise.all([
        getUserBalance(userId),
        getUserTransactions(userId),
        getUserUnlockedGames(userId)
      ]);
      
      console.log('🔐 User data loaded:', {
        balance,
        transactionCount: transactions.length,
        unlockedGamesCount: unlockedGames.length
      });
      
      if (!mountedRef.current) return;
      
      safeSetState(prev => ({
        ...prev,
        pirateCoins: balance,
        transactions,
        unlockedGames
      }));
    } catch (error) {
      console.error('🔐 Error loading user data:', error);
    }
  }, []);

  return { loadUserData };
};
