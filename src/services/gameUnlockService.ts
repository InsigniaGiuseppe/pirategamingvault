
import { supabase } from "@/integrations/supabase/client";

// Get user's unlocked games
export const getUserUnlockedGames = async (userId: string): Promise<string[]> => {
  // First 4 games are always unlocked
  const defaultUnlocked = ['1', '2', '3', '4'];
  
  const { data, error } = await supabase
    .from('unlocked_games')
    .select('game_id')
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error getting unlocked games:', error);
    return defaultUnlocked;
  }
  
  const unlockedIds = data.map(item => item.game_id);
  return [...new Set([...defaultUnlocked, ...unlockedIds])];
};
