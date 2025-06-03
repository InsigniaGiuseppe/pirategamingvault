
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

// Prepare local games with proper coin costs
const prepareLocalGames = (): Game[] => {
  return localGames.map(game => ({
    ...game,
    coinCost: game.coinCost < 10 ? Math.floor(Math.random() * 41) + 10 : game.coinCost,
    unlocked: false
  }));
};

// Emergency fix: Always return local games immediately to prevent freezing
export const getGames = async (): Promise<Game[]> => {
  console.log('Loading games locally only (emergency mode)');
  
  // Return local games immediately - no Supabase calls
  const localOnlyGames = prepareLocalGames();
  console.log(`Loaded ${localOnlyGames.length} games locally`);
  
  return localOnlyGames;
};

// Disabled function to prevent any database calls
export const randomizeGamePrices = async (): Promise<boolean> => {
  console.log('Price randomization disabled in emergency mode');
  return true;
};

// Function to clear games cache (now just logs)
export const clearGamesCache = (): void => {
  console.log('Games cache cleared (local mode)');
};
