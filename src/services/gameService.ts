
import { supabase } from "@/integrations/supabase/client";

export interface Game {
  id: string;
  title: string;
  imgSrc?: string;
  isPiratePun?: boolean;
  coinCost: number;
  category?: string;
  created_at?: string;
}

// Fetch all games from Supabase
export const fetchGames = async (): Promise<Game[]> => {
  const { data, error } = await supabase
    .from('games')
    .select('*');
  
  if (error) {
    console.error('Error fetching games:', error);
    return [];
  }
  
  // Transform the data to match our Game interface
  return data.map(game => ({
    id: game.id,
    title: game.title,
    imgSrc: game.img_src,
    isPiratePun: game.is_pirate_pun,
    coinCost: game.coin_cost,
    category: game.category
  }));
};

// Check if a game is unlocked for the current user
export const checkGameUnlocked = async (gameId: string, userId: string): Promise<boolean> => {
  // Free games (1-4) are always unlocked
  if (['1', '2', '3', '4'].includes(gameId)) {
    return true;
  }
  
  const { data, error } = await supabase
    .from('unlocked_games')
    .select('*')
    .eq('user_id', userId)
    .eq('game_id', gameId)
    .single();
  
  if (error) {
    return false;
  }
  
  return !!data;
};

// Unlock a game for a user
export const unlockGame = async (gameId: string, userId: string, cost: number): Promise<boolean> => {
  // First, check user's balance
  const { data: balanceData, error: balanceError } = await supabase
    .from('user_balance')
    .select('balance')
    .eq('user_id', userId)
    .single();
  
  if (balanceError || !balanceData || balanceData.balance < cost) {
    console.error('Not enough coins or error checking balance:', balanceError);
    return false;
  }
  
  // Start a transaction to update balance and add game to unlocked list
  // We'll use two separate operations since Supabase doesn't support true transactions
  
  // 1. Update balance
  const { error: updateError } = await supabase
    .from('user_balance')
    .update({ balance: balanceData.balance - cost })
    .eq('user_id', userId);
  
  if (updateError) {
    console.error('Error updating balance:', updateError);
    return false;
  }
  
  // 2. Add transaction record
  const { error: transactionError } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      amount: -cost,
      description: `Unlocked game #${gameId}`,
      type: 'spend'
    });
  
  if (transactionError) {
    console.error('Error recording transaction:', transactionError);
    // We should revert the balance change here in a real app
  }
  
  // 3. Add game to unlocked list
  const { error: unlockError } = await supabase
    .from('unlocked_games')
    .insert({
      user_id: userId,
      game_id: gameId
    });
  
  if (unlockError) {
    console.error('Error unlocking game:', unlockError);
    // We should revert the previous changes here in a real app
    return false;
  }
  
  return true;
};
