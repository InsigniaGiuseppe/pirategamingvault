
import { useState } from 'react';
import { Game } from '@/data/games';
import SecretCodeModal from './SecretCodeModal';
import { Tag, Info } from 'lucide-react';

interface GameTileProps {
  game: Game;
}

const GameTile = ({ game }: GameTileProps) => {
  const [showModal, setShowModal] = useState(false);

  // Map game titles to their corresponding image sources
  const gameImageMap: { [key: string]: string } = {
    "Sea of Thieves": "https://upload.wikimedia.org/wikipedia/en/7/77/Sea_of_thieves_cover_art.jpg",
    "Assassin's Creed IV: Black Flag": "https://upload.wikimedia.org/wikipedia/en/2/28/Assassins_Creed_IV_-_Black_Flag_cover.jpg",
    "The Secret of Monkey Island": "https://upload.wikimedia.org/wikipedia/en/a/a8/The_Secret_of_Monkey_Island_artwork.jpg",
    "Sid Meier's Pirates!": "https://upload.wikimedia.org/wikipedia/en/0/0f/Sid_Meier%27s_Pirates%21_%282004%29_Coverart.png",
    "Port Royale 4": "https://cdn.cloudflare.steamstatic.com/steam/apps/1024650/header.jpg",
    "Skull & Bones": "https://upload.wikimedia.org/wikipedia/en/e/e4/Skull_and_Bones_cover_art.jpg",
    "ATLAS": "https://cdn.cloudflare.steamstatic.com/steam/apps/834910/header.jpg",
    "Pillars of Eternity II: Deadfire": "https://upload.wikimedia.org/wikipedia/en/3/3a/Pillars_of_Eternity_II_Deadfire_cover_art.jpg",
    "One Piece: Pirate Warriors 4": "https://upload.wikimedia.org/wikipedia/en/0/0c/One_Piece_Pirate_Warriors_4.jpg",
    "Risen 2: Dark Waters": "https://upload.wikimedia.org/wikipedia/en/1/11/Risen_2_-_Dark_Waters_cover.jpg",
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
    
    // Try Unsplash with the game title
    const unsplashUrl = `https://source.unsplash.com/600x800/?${encodeURIComponent(game.title)}`;
    
    // Fall back to Picsum with the game title as seed
    const picsumUrl = `https://picsum.photos/seed/${encodeURIComponent(game.title.toLowerCase().replace(/\s+/g, '-'))}/600/800`;
    
    // Return original source from game data as last resort
    return game.imgSrc || picsumUrl;
  };

  // Get the appropriate image source
  const imageSource = getImageSource(game);

  return (
    <>
      <div 
        className="relative cursor-pointer group transition-transform duration-200 hover:scale-105"
        onClick={() => setShowModal(true)}
      >
        <div className="bg-white/95 rounded-lg shadow-saas overflow-hidden hover:shadow-saas-primary transition-shadow duration-300">
          <div className="relative h-full">
            <img 
              src={imageSource} 
              alt={game.title}
              className="w-full h-full aspect-[16/9] object-cover rounded-t-lg"
              onError={(e) => {
                // Fall back to picsum if the image fails to load
                const target = e.target as HTMLImageElement;
                if (!target.src.includes('picsum.photos')) {
                  target.src = `https://picsum.photos/seed/${encodeURIComponent(game.title.toLowerCase().replace(/\s+/g, '-'))}/600/800`;
                }
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent"></div>
            
            <div className="absolute top-3 left-3 bg-saas-lavender/90 px-2 py-1 rounded text-xs font-heading text-white flex items-center">
              <Tag size={12} className="mr-1" />
              {game.title}
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-between items-center">
              <span className="text-saas-text-headline text-sm font-medium truncate">{game.title}</span>
              <div className="bg-saas-grey-100 text-saas-text-body rounded-full w-6 h-6 flex items-center justify-center">
                <Info size={14} />
              </div>
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
