
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

// Cache for games data
let gamesCache: Game[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Timeout wrapper for promises
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    )
  ]);
}

// Prepare local games with proper coin costs
const prepareLocalGames = (): Game[] => {
  return localGames.map(game => ({
    ...game,
    coinCost: game.coinCost < 10 ? Math.floor(Math.random() * 41) + 10 : game.coinCost,
    unlocked: false
  }));
};

// This function will fetch games with timeout and robust fallback
export const getGames = async (): Promise<Game[]> => {
  console.log('Starting getGames...');
  
  // Check cache first
  const now = Date.now();
  if (gamesCache && (now - cacheTimestamp) < CACHE_DURATION) {
    console.log('Returning cached games');
    return gamesCache;
  }
  
  // Prepare fallback games immediately
  const fallbackGames = prepareLocalGames();
  
  try {
    console.log('Attempting to fetch from Supabase with timeout...');
    
    // Try to fetch from Supabase with a 3-second timeout
    const supabaseGames = await withTimeout(fetchGames(), 3000);
    
    if (supabaseGames && supabaseGames.length > 0) {
      console.log(`Successfully fetched ${supabaseGames.length} games from Supabase`);
      gamesCache = supabaseGames;
      cacheTimestamp = now;
      return supabaseGames;
    } else {
      console.log('No games returned from Supabase, using fallback');
      gamesCache = fallbackGames;
      cacheTimestamp = now;
      return fallbackGames;
    }
  } catch (error) {
    console.warn('Supabase fetch failed or timed out, using local games:', error);
    gamesCache = fallbackGames;
    cacheTimestamp = now;
    return fallbackGames;
  }
};

// Function to randomize all game prices in the database (with timeout)
export const randomizeGamePrices = async (): Promise<boolean> => {
  try {
    console.log('Attempting to randomize game prices...');
    const result = await withTimeout(updateAllGamePrices(10, 50), 5000);
    
    // Clear cache to force refresh
    gamesCache = null;
    cacheTimestamp = 0;
    
    return result;
  } catch (error) {
    console.error('Error randomizing game prices:', error);
    return false;
  }
};

// Function to clear games cache
export const clearGamesCache = (): void => {
  gamesCache = null;
  cacheTimestamp = 0;
  console.log('Games cache cleared');
};
