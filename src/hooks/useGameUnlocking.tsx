
import { useContext } from 'react';
import { useToast } from '@/hooks/use-toast';
import { unlockGame } from '@/services/gameService';
import { getUserTransactions, getUserUnlockedGames, getUserBalance } from '@/services/userService';
import { AuthStateContext } from './useAuthState';

export const useGameUnlocking = () => {
  const { toast } = useToast();
  const context = useContext(AuthStateContext);
  const { userId, pirateCoins, unlockedGames } = context;
  
  const setState = 'setState' in context ? context.setState : undefined;
  
  const handleUnlockGame = async (gameId: string, cost: number) => {
    if (!userId) return false;
    
    // Check if user has enough coins
    if (pirateCoins < cost) {
      toast({
        variant: "destructive",
        title: "Not Enough Coins",
        description: `You need ${cost - pirateCoins} more coins to unlock this game.`
      });
      return false;
    }
    
    // Unlock game with Supabase
    const success = await unlockGame(gameId, userId, cost);
    
    if (success && setState) {
      // Update local coin state
      // Get updated transactions list
      const updatedTransactions = await getUserTransactions(userId);
      
      // Get updated unlocked games list
      const updatedGames = await getUserUnlockedGames(userId);
      
      // Get updated balance
      const newBalance = await getUserBalance(userId);
      
      setState(prev => ({
        ...prev,
        pirateCoins: newBalance,
        transactions: updatedTransactions,
        unlockedGames: updatedGames
      }));
      
      return true;
    }
    
    return false;
  };
  
  const checkIfGameUnlocked = (gameId: string) => {
    return unlockedGames.includes(gameId);
  };
  
  return { unlockGame: handleUnlockGame, checkIfGameUnlocked };
};
