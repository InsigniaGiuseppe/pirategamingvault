
import { useCallback } from 'react';
import { updateUserBalance } from '@/services/userService';
import { activityLogger } from '@/services/activityLoggingService';
import type { AuthState } from './types';

export const useAuthCoins = (
  state: AuthState,
  loadUserData: (userId: string) => Promise<void>,
  mountedRef: React.MutableRefObject<boolean>
) => {
  const addPirateCoins = useCallback(async (amount: number, description?: string) => {
    if (!state.user?.id) {
      console.warn('🔐 Cannot add coins: No user ID');
      return;
    }
    
    console.log('🔐 Adding coins:', { amount, description, userId: state.user.id });
    
    try {
      const success = await updateUserBalance(
        state.user.id, 
        amount, 
        description || 'Coins added', 
        'earn'
      );
      
      console.log('🔐 Add coins result:', success);
      
      if (success && mountedRef.current) {
        await loadUserData(state.user.id);
      }
    } catch (error) {
      console.error('🔐 Error adding pirate coins:', error);
    }
  }, [state.user?.id, loadUserData, mountedRef]);

  const unlockGame = useCallback(async (gameId: string, cost: number): Promise<boolean> => {
    if (!state.user?.id || state.pirateCoins < cost) {
      console.warn('🔐 Cannot unlock game:', {
        hasUserId: !!state.user?.id,
        currentCoins: state.pirateCoins,
        cost
      });
      return false;
    }
    
    console.log('🔐 Unlocking game:', { gameId, cost, userId: state.user.id });
    
    try {
      const success = await updateUserBalance(
        state.user.id, 
        -cost, 
        `Unlocked game: ${gameId}`, 
        'spend'
      );
      
      console.log('🔐 Game unlock result:', success);
      
      if (success && mountedRef.current) {
        try {
          await activityLogger.logGameUnlocked(state.user.id, gameId, gameId, cost);
          console.log('🔐 Game unlock activity logged');
        } catch (activityError) {
          console.warn('🔐 Failed to log game unlock activity:', activityError);
        }
        
        await loadUserData(state.user.id);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('🔐 Error unlocking game:', error);
      return false;
    }
  }, [state.user?.id, state.pirateCoins, loadUserData, mountedRef]);

  const checkIfGameUnlocked = useCallback((gameId: string): boolean => {
    const isUnlocked = state.unlockedGames.includes(gameId);
    console.log('🔐 Checking game unlock status:', { gameId, isUnlocked });
    return isUnlocked;
  }, [state.unlockedGames]);

  return { addPirateCoins, unlockGame, checkIfGameUnlocked };
};
