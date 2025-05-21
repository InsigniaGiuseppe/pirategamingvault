
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

// Extended game list with 15+ games
const extendedGameList: Game[] = [
  // All games now require coins to unlock (removed free games concept)
  { id: '1', title: 'Sea of Thieves', imgSrc: 'https://static-cdn.jtvnw.net/ttv-boxart/490377-285x380.jpg', coinCost: 10, category: 'action' },
  { id: '2', title: 'Assassin\'s Creed IV: Black Flag', imgSrc: 'https://static-cdn.jtvnw.net/ttv-boxart/Assassin\'s%20Creed%20IV:%20Black%20Flag-285x380.jpg', coinCost: 8, category: 'action' },
  { id: '3', title: 'The Secret of Monkey Island', imgSrc: 'https://static-cdn.jtvnw.net/ttv-boxart/The%20Secret%20of%20Monkey%20Island-285x380.jpg', coinCost: 5, category: 'adventure' },
  { id: '4', title: 'Sid Meier\'s Pirates!', imgSrc: 'https://static-cdn.jtvnw.net/ttv-boxart/Sid%20Meier\'s%20Pirates!-285x380.jpg', coinCost: 7, category: 'strategy' },
  
  // Premium games (require coins to unlock)
  { id: '5', title: 'Port Royale 4', imgSrc: 'https://static-cdn.jtvnw.net/ttv-boxart/Port%20Royale%204-285x380.jpg', coinCost: 15, category: 'strategy' },
  { id: '6', title: 'Blackwake', imgSrc: 'https://static-cdn.jtvnw.net/ttv-boxart/Blackwake-285x380.jpg', coinCost: 10, category: 'action' },
  { id: '7', title: 'Pillars of Eternity II: Deadfire', imgSrc: 'https://static-cdn.jtvnw.net/ttv-boxart/Pillars%20of%20Eternity%20II:%20Deadfire-285x380.jpg', coinCost: 20, category: 'rpg' },
  { id: '8', title: 'Skull and Bones', imgSrc: 'https://static-cdn.jtvnw.net/ttv-boxart/Skull%20and%20Bones-285x380.jpg', coinCost: 25, category: 'action' },
  { id: '9', title: 'Atlas', imgSrc: 'https://static-cdn.jtvnw.net/ttv-boxart/Atlas-285x380.jpg', coinCost: 15, category: 'adventure' },
  { id: '10', title: 'Risen 2: Dark Waters', imgSrc: 'https://static-cdn.jtvnw.net/ttv-boxart/Risen%202:%20Dark%20Waters-285x380.jpg', coinCost: 12, category: 'rpg' },
  { id: '11', title: 'One Piece Odyssey', imgSrc: 'https://static-cdn.jtvnw.net/ttv-boxart/One%20Piece%20Odyssey-285x380.jpg', coinCost: 20, category: 'rpg' },
  { id: '12', title: 'One Piece: World Seeker', imgSrc: 'https://static-cdn.jtvnw.net/ttv-boxart/One%20Piece:%20World%20Seeker-285x380.jpg', coinCost: 18, category: 'action' },
  { id: '13', title: 'King of Seas', imgSrc: 'https://static-cdn.jtvnw.net/ttv-boxart/King%20of%20Seas-285x380.jpg', coinCost: 10, category: 'adventure' },
  { id: '14', title: 'Furious Seas', imgSrc: 'https://static-cdn.jtvnw.net/ttv-boxart/Furious%20Seas-285x380.jpg', coinCost: 10, category: 'action' },
  { id: '15', title: 'ATLAS', imgSrc: 'https://static-cdn.jtvnw.net/ttv-boxart/ATLAS-285x380.jpg', coinCost: 15, category: 'adventure' },
  { id: '16', title: 'Sailwind', imgSrc: 'https://static-cdn.jtvnw.net/ttv-boxart/Sailwind-285x380.jpg', coinCost: 8, category: 'simulation' },
  { id: '17', title: 'The Legend of Zelda: Wind Waker HD', imgSrc: 'https://static-cdn.jtvnw.net/ttv-boxart/The%20Legend%20of%20Zelda:%20Wind%20Waker%20HD-285x380.jpg', coinCost: 22, category: 'adventure' },
  { id: '18', title: 'Raft', imgSrc: 'https://static-cdn.jtvnw.net/ttv-boxart/Raft-285x380.jpg', coinCost: 12, category: 'survival' },
  { id: '19', title: 'Subnautica', imgSrc: 'https://static-cdn.jtvnw.net/ttv-boxart/Subnautica-285x380.jpg', coinCost: 18, category: 'adventure' },
  { id: '20', title: 'Stranded Deep', imgSrc: 'https://static-cdn.jtvnw.net/ttv-boxart/Stranded%20Deep-285x380.jpg', coinCost: 10, category: 'survival' }
];

// This function will fetch games from Supabase and fallback to local games if needed
export const getGames = async (): Promise<Game[]> => {
  try {
    const supabaseGames = await fetchGames();
    
    if (supabaseGames.length > 0) {
      return supabaseGames;
    }
    
    // Fall back to extended local games with updated coin costs
    return extendedGameList.map(game => ({
      ...game,
      // Make sure all games have a random coin cost
      coinCost: game.coinCost || Math.floor(Math.random() * 17) + 3, // 3-20 coins
    }));
  } catch (error) {
    console.error('Error fetching games:', error);
    
    // Fall back to extended local games with updated coin costs
    return extendedGameList.map(game => ({
      ...game,
      // Make sure all games have a random coin cost
      coinCost: game.coinCost || Math.floor(Math.random() * 17) + 3, // 3-20 coins
    }));
  }
};

// Function to randomize all game prices in the database
export const randomizeGamePrices = async (): Promise<boolean> => {
  try {
    return await updateAllGamePrices(3, 20); // Set all games to have prices between 3 and 20 coins
  } catch (error) {
    console.error('Error randomizing game prices:', error);
    return false;
  }
};
