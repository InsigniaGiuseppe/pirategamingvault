
import { supabase } from "@/integrations/supabase/client";

// Get user unlocked games
export const getUserUnlockedGames = async (userId: string): Promise<string[]> => {
  try {
    console.log('Getting unlocked games for user:', userId);
    
    const { data, error } = await supabase
      .from('unlocked_games')
      .select('game_id')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching unlocked games:', error);
      return [];
    }
    
    return (data || []).map(item => item.game_id);
  } catch (error) {
    console.error('Unexpected error in getUserUnlockedGames:', error);
    return [];
  }
};

// Check if game is unlocked for user
export const isGameUnlocked = async (userId: string, gameId: string): Promise<boolean> => {
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

// Unlock a game for user
export const unlockGame = async (userId: string, gameId: string): Promise<boolean> => {
  try {
    // Check if already unlocked first
    const alreadyUnlocked = await isGameUnlocked(userId, gameId);
    
    if (alreadyUnlocked) {
      return true; // Already unlocked
    }
    
    const { error } = await supabase
      .from('unlocked_games')
      .insert([{
        user_id: userId,
        game_id: gameId
      }]);
    
    if (error) {
      console.error('Error unlocking game:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error in unlockGame:', error);
    return false;
  }
};
