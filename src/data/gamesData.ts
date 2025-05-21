
import { fetchGames, updateAllGamePrices } from '@/services/gameService';
import { games as localGames } from './games';

export interface Game {
  id: string;
  title: string;
  imgSrc?: string;
  isPiratePun?: boolean;
  coinCost: number;
  category?: string;
  unlocked?: boolean;
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
      // Make sure all games have a random coin cost between 10-50
      coinCost: game.coinCost < 10 ? Math.floor(Math.random() * 41) + 10 : game.coinCost,
      // No games are unlocked by default
      unlocked: false
    }));
  } catch (error) {
    console.error('Error fetching games:', error);
    
    // Fall back to local games with updated coin costs
    return localGames.map(game => ({
      ...game,
      // Make sure all games have a random coin cost between 10-50
      coinCost: game.coinCost < 10 ? Math.floor(Math.random() * 41) + 10 : game.coinCost,
      // No games are unlocked by default
      unlocked: false
    }));
  }
};

// Function to randomize all game prices in the database
export const randomizeGamePrices = async (): Promise<boolean> => {
  try {
    return await updateAllGamePrices(10, 50); // Set all games to have prices between 10 and 50 coins
  } catch (error) {
    console.error('Error randomizing game prices:', error);
    return false;
  }
};
