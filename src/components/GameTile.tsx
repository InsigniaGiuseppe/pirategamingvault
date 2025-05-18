
import { useState } from 'react';
import { Game } from '@/data/games';
import SecretCodeModal from './SecretCodeModal';
import { Tag, Info, Lock, Coins } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';

interface GameTileProps {
  game: Game;
}

const GameTile = ({ game }: GameTileProps) => {
  const [showModal, setShowModal] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const { pirateCoins, addPirateCoins } = useAuth();
  const { toast } = useToast();
  
  // Check if user can afford to unlock this game
  const canAfford = pirateCoins >= game.coinCost;
  
  // Function to handle game unlocking with coins
  const handleUnlock = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!canAfford) {
      toast({
        variant: "destructive",
        title: "Not Enough Coins",
        description: `You need ${game.coinCost - pirateCoins} more Pirate Coins to unlock this game.`
      });
      return;
    }
    
    setIsUnlocking(true);
    
    // Simulate unlock process
    setTimeout(() => {
      // Deduct coins
      addPirateCoins(-game.coinCost);
      
      // Update local storage to mark this game as unlocked
      const unlockedGames = JSON.parse(localStorage.getItem('unlockedGames') || '[]');
      unlockedGames.push(game.id);
      localStorage.setItem('unlockedGames', JSON.stringify(unlockedGames));
      
      // Update UI
      game.unlocked = true;
      setIsUnlocking(false);
      
      toast({
        title: "Game Unlocked!",
        description: `You've successfully unlocked ${game.title}.`
      });
    }, 1000);
  };
  
  // Check if this game is unlocked in local storage
  const checkIfUnlocked = () => {
    if (game.coinCost === 0) return true; // Free games are always unlocked
    const unlockedGames = JSON.parse(localStorage.getItem('unlockedGames') || '[]');
    return game.unlocked || unlockedGames.includes(game.id);
  };
  
  const isUnlocked = checkIfUnlocked();

  // Updated map of game titles to their corresponding image sources
  const gameImageMap: { [key: string]: string } = {
    "Sea of Thieves": "https://upload.wikimedia.org/wikipedia/en/7/77/Sea_of_thieves_cover_art.jpg",
    "Assassin's Creed IV: Black Flag": "https://upload.wikimedia.org/wikipedia/en/1/16/Assassin%27s_Creed_IV_-_Black_Flag_cover.jpg",
    "The Secret of Monkey Island": "https://upload.wikimedia.org/wikipedia/en/a/a8/The_Secret_of_Monkey_Island_artwork.jpg",
    "Sid Meier's Pirates!": "https://upload.wikimedia.org/wikipedia/en/0/0f/Sid_Meier%27s_Pirates%21_%282004%29_Coverart.png",
    "Port Royale 4": "https://cdn.cloudflare.steamstatic.com/steam/apps/1024650/header.jpg",
    "Skull & Bones": "https://upload.wikimedia.org/wikipedia/en/e/e4/Skull_and_Bones_cover_art.jpg",
    "ATLAS": "https://cdn.cloudflare.steamstatic.com/steam/apps/834910/header.jpg",
    "Pillars of Eternity II: Deadfire": "https://upload.wikimedia.org/wikipedia/en/3/3a/Pillars_of_Eternity_II_Deadfire_cover_art.jpg",
    "One Piece: Pirate Warriors 4": "https://upload.wikimedia.org/wikipedia/en/0/0c/One_Piece_Pirate_Warriors_4.jpg",
    "Risen 2: Dark Waters": "https://upload.wikimedia.org/wikipedia/en/1/11/Risen_2_-_Dark_Waters_cover.jpg",
    "Blackwake": "https://cdn.cloudflare.steamstatic.com/steam/apps/420290/header.jpg",
    "King of Seas": "https://cdn.cloudflare.steamstatic.com/steam/apps/1209410/header.jpg",
    "Furious Seas": "https://cdn.cloudflare.steamstatic.com/steam/apps/875760/header.jpg",
    "Tempest: Pirate Action RPG": "https://cdn.cloudflare.steamstatic.com/steam/apps/418180/header.jpg",
    "Man O' War: Corsair": "https://cdn.cloudflare.steamstatic.com/steam/apps/344240/header.jpg",
    "Once Human": "https://cdn.cloudflare.steamstatic.com/steam/apps/2139460/header.jpg",
    "Valheim": "https://upload.wikimedia.org/wikipedia/en/7/77/Valheim_2021_logo.jpg",
    "Destiny 2": "https://upload.wikimedia.org/wikipedia/en/4/4d/Destiny_2_box_art.jpg",
    "Rust": "https://cdn.cloudflare.steamstatic.com/steam/apps/252490/header.jpg",
    "Apex Legends": "https://upload.wikimedia.org/wikipedia/en/8/8f/Apex_legends_cover.jpg",
    "Baldur's Gate 3": "https://upload.wikimedia.org/wikipedia/en/b/b2/Baldurs_Gate_3_cover_art.jpg",
    "Minecraft": "https://upload.wikimedia.org/wikipedia/en/5/51/Minecraft_cover.png",
    "Elden Ring": "https://upload.wikimedia.org/wikipedia/en/5/5e/Elden_Ring_Box_art.jpg",
    "Cyberpunk 2077": "https://upload.wikimedia.org/wikipedia/en/9/9f/Cyberpunk_2077_box_art.jpg"
  };

  // Function to get image source with fallbacks
  const getImageSource = (game: Game) => {
    // Try mapped image first
    if (gameImageMap[game.title]) {
      return gameImageMap[game.title];
    }
    
    // Try the image source from the game data
    if (game.imgSrc) {
      return game.imgSrc;
    }
    
    // Fall back to Unsplash with the game title
    const unsplashUrl = `https://source.unsplash.com/600x800/?${encodeURIComponent(game.title)}`;
    
    // Fall back to Picsum with the game title as seed
    return `https://picsum.photos/seed/${encodeURIComponent(game.title.toLowerCase().replace(/\s+/g, '-'))}/600/800`;
  };

  // Get the appropriate image source
  const imageSource = getImageSource(game);

  const handleGameClick = () => {
    if (isUnlocked) {
      setShowModal(true);
    } else {
      toast({
        title: "Game Locked",
        description: `This game costs ${game.coinCost} Pirate Coins to unlock.`,
      });
    }
  };

  return (
    <>
      <div 
        className={`relative cursor-pointer group transition-transform duration-200 hover:scale-105 ${!isUnlocked ? 'opacity-80' : ''}`}
        onClick={handleGameClick}
      >
        <div className="bg-white rounded-lg shadow-saas overflow-hidden hover:shadow-saas-hover transition-shadow duration-300">
          <div className="relative h-full">
            <img 
              src={imageSource} 
              alt={game.title}
              className={`w-full h-full aspect-[16/9] object-cover rounded-t-lg ${!isUnlocked ? 'grayscale brightness-[0.7]' : ''} group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-200`}
              onError={(e) => {
                // Fall back to picsum if the image fails to load
                const target = e.target as HTMLImageElement;
                if (!target.src.includes('picsum.photos')) {
                  target.src = `https://picsum.photos/seed/${encodeURIComponent(game.title.toLowerCase().replace(/\s+/g, '-'))}/600/800`;
                }
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent"></div>
            
            <div className="absolute top-3 left-3 bg-black/90 px-2 py-1 rounded text-xs font-heading text-white flex items-center">
              <Tag size={12} className="mr-1" />
              {game.title}
            </div>
            
            {game.coinCost > 0 && !isUnlocked && (
              <div className="absolute top-3 right-3 bg-black/90 px-2 py-1 rounded text-xs font-heading text-white flex items-center">
                <Coins size={12} className="mr-1 text-yellow-500" />
                {game.coinCost}
              </div>
            )}
            
            <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-between items-center">
              <span className="text-black text-sm font-medium truncate">{game.title}</span>
              {!isUnlocked ? (
                <Button 
                  onClick={handleUnlock}
                  size="sm"
                  variant="outline"
                  disabled={!canAfford || isUnlocking}
                  className="h-7 rounded-full px-2 flex items-center gap-1 bg-white/90 border-yellow-500 text-black"
                >
                  <Lock size={12} className="text-yellow-500" />
                  <span>{isUnlocking ? '...' : 'Unlock'}</span>
                </Button>
              ) : (
                <div className="bg-gray-100 text-black rounded-full w-6 h-6 flex items-center justify-center">
                  <Info size={14} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <SecretCodeModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        gameTitle={game.title}
      />
    </>
  );
};

export default GameTile;
