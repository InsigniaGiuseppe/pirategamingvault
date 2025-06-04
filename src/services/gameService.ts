
import { supabase } from "@/integrations/supabase/client";

// Unlock game with Supabase
export const unlockGame = async (gameId: string, userId: string, cost: number): Promise<boolean> => {
  try {
    console.log('Unlocking game:', gameId, 'for user:', userId, 'cost:', cost);
    
    // Check if game is already unlocked
    const { data: existingUnlock } = await supabase
      .from('unlocked_games')
      .select('id')
      .eq('user_id', userId)
      .eq('game_id', gameId)
      .maybeSingle();
    
    if (existingUnlock) {
      console.log('Game already unlocked');
      return true;
    }
    
    // Get current balance
    const { data: balanceData, error: balanceError } = await supabase
      .from('user_balance')
      .select('balance')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (balanceError || !balanceData) {
      console.error('Error getting user balance:', balanceError);
      return false;
    }
    
    const currentBalance = balanceData.balance || 0;
    
    if (currentBalance < cost) {
      console.log('Insufficient balance');
      return false;
    }
    
    // Create transaction for game unlock
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert([{
        user_id: userId,
        amount: -cost,
        description: `Unlocked game: ${gameId}`,
        type: 'spend'
      }]);
    
    if (transactionError) {
      console.error('Error creating unlock transaction:', transactionError);
      return false;
    }
    
    // Update balance
    const { error: balanceUpdateError } = await supabase
      .from('user_balance')
      .update({ 
        balance: currentBalance - cost,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
    
    if (balanceUpdateError) {
      console.error('Error updating balance:', balanceUpdateError);
      return false;
    }
    
    // Add unlocked game record
    const { error: unlockError } = await supabase
      .from('unlocked_games')
      .insert([{
        user_id: userId,
        game_id: gameId
      }]);
    
    if (unlockError) {
      console.error('Error unlocking game:', unlockError);
      return false;
    }
    
    console.log('Game unlocked successfully');
    return true;
  } catch (error) {
    console.error('Unexpected error in unlockGame:', error);
    return false;
  }
};

// Check if game is unlocked
export const isGameUnlocked = async (gameId: string, userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('unlocked_games')
      .select('id')
      .eq('user_id', userId)
      .eq('game_id', gameId)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking if game is unlocked:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Unexpected error in isGameUnlocked:', error);
    return false;
  }
};
