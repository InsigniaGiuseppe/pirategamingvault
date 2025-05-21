
import { supabase } from "@/integrations/supabase/client";

// Get user's unlocked games
export const getUserUnlockedGames = async (userId: string): Promise<string[]> => {
  // No more default unlocked games - all games must be purchased
  
  const { data, error } = await supabase
    .from('unlocked_games')
    .select('game_id')
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error getting unlocked games:', error);
    return [];
  }
  
  return data.map(item => item.game_id);
};
