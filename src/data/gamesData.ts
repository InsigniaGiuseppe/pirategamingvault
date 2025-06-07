
import { games as localGames } from './games';
import { featuredGames } from './featuredGames';

export interface Game {
  id: string;
  title: string;
  imgSrc?: string;
  isPiratePun?: boolean;
  coinCost: number;
  category?: string;
  unlocked?: boolean;
}

// Prepare local games
const prepareLocalGames = (): Game[] => {
  return [...featuredGames, ...localGames].map(game => ({
    ...game,
    unlocked: false
  }));
};

// Always return local games immediately to prevent freezing
export const getGames = async (): Promise<Game[]> => {
  console.log('Loading games locally with proper Steam images');
  
  // Return local games immediately - no external calls
  const updatedGames = prepareLocalGames();
  console.log(`Loaded ${updatedGames.length} games with proper images`);
  
  return updatedGames;
};

// Disabled function to prevent any database calls
export const randomizeGamePrices = async (): Promise<boolean> => {
  console.log('Price randomization disabled in local mode');
  return true;
};

// Function to clear games cache (now just logs)
export const clearGamesCache = (): void => {
  console.log('Games cache cleared (local mode)');
};
