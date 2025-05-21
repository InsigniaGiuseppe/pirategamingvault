
import { supabase } from "@/integrations/supabase/client";

export interface Game {
  id: string;
  title: string;
  imgSrc?: string;
  isPiratePun?: boolean;
  coinCost: number;
  category?: string;
  created_at?: string;
  unlocked?: boolean;
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
    imgSrc: game.img_src || getTwitchImageUrl(game.title),
    isPiratePun: game.is_pirate_pun,
    coinCost: game.coin_cost,
    category: game.category,
    created_at: game.created_at,
    unlocked: ['1', '2', '3', '4'].includes(game.id) // First four games are always unlocked
  }));
};

// Generate Twitch image URL from game title
export const getTwitchImageUrl = (gameTitle: string): string => {
  // Format the game title for use in URL
  const formattedTitle = encodeURIComponent(gameTitle);
  return `https://static-cdn.jtvnw.net/ttv-boxart/${formattedTitle}-285x380.jpg`;
};

// Check if a game is unlocked for the current user
export const checkGameUnlocked = async (gameId: string, userId: string): Promise<boolean> => {
  // Free games (1-4) are always unlocked
  if (['1', '2', '3', '4'].includes(gameId)) {
    return true;
  }
  
  // Check for free games in the database (coin cost of 0)
  const { data: gameData, error: gameError } = await supabase
    .from('games')
    .select('coin_cost')
    .eq('id', gameId)
    .single();
  
  if (gameData && gameData.coin_cost === 0) {
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

// Get game details by ID
export const getGameById = async (gameId: string): Promise<Game | null> => {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', gameId)
    .single();
  
  if (error || !data) {
    console.error('Error fetching game details:', error);
    return null;
  }
  
  return {
    id: data.id,
    title: data.title,
    imgSrc: data.img_src || getTwitchImageUrl(data.title),
    isPiratePun: data.is_pirate_pun,
    coinCost: data.coin_cost,
    category: data.category,
    created_at: data.created_at,
  };
};

// Add additional games to the list - this is a function to add new games if needed
export const addGamesToDatabase = async (games: Omit<Game, 'unlocked' | 'created_at'>[]): Promise<void> => {
  const formattedGames = games.map(game => ({
    id: game.id,
    title: game.title,
    img_src: game.imgSrc || getTwitchImageUrl(game.title),
    is_pirate_pun: game.isPiratePun || false,
    coin_cost: game.coinCost,
    category: game.category || 'other'
  }));
  
  const { error } = await supabase
    .from('games')
    .insert(formattedGames);
  
  if (error) {
    console.error("Error adding games to database:", error);
  } else {
    console.log(`Successfully added ${formattedGames.length} games to database`);
  }
};
