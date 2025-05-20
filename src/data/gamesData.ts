
import { fetchGames } from '@/services/gameService';
import { games as localGames } from './games';

export interface Game {
  id: string;
  title: string;
  imgSrc?: string;
  isPiratePun?: boolean;
  coinCost: number;
  category?: string;
}

// This function will fetch games from Supabase and fallback to local games if needed
export const getGames = async (): Promise<Game[]> => {
  try {
    const supabaseGames = await fetchGames();
    
    if (supabaseGames.length > 0) {
      return supabaseGames;
    }
    
    // Fall back to local games with updated coin costs
    return localGames.map(game => ({
      ...game,
      // Make sure all games except first 4 have a coin cost
      coinCost: ['1', '2', '3', '4'].includes(game.id) ? 0 : (game.coinCost || 15)
    }));
  } catch (error) {
    console.error('Error fetching games:', error);
    
    // Fall back to local games with updated coin costs
    return localGames.map(game => ({
      ...game,
      // Make sure all games except first 4 have a coin cost
      coinCost: ['1', '2', '3', '4'].includes(game.id) ? 0 : (game.coinCost || 15)
    }));
  }
};
