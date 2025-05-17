
import { useState } from 'react';
import { Game } from '@/data/games';
import SecretCodeModal from './SecretCodeModal';
import { Tag, Info } from 'lucide-react';

interface GameTileProps {
  game: Game;
}

const GameTile = ({ game }: GameTileProps) => {
  const [showModal, setShowModal] = useState(false);

  // Map game titles to their corresponding uploaded images
  const gameImageMap: { [key: string]: string } = {
    "Deciphered Seas": "/lovable-uploads/deciphered-seas.jpg",
    "Binary Plunder": "/lovable-uploads/binary-plunder.jpg",
    "Code of the Caribbean": "/lovable-uploads/code-of-the-caribbean.jpg",
    "Piracy Protocol": "/lovable-uploads/piracy-protocol.jpg",
    "Silicon Sails": "/lovable-uploads/silicon-sails.jpg",
    "Digital Doubloons": "/lovable-uploads/digital-doubloons.jpg",
    "Byte the Plank": "/lovable-uploads/byte-the-plank.jpg",
    "Cache Corsairs": "/lovable-uploads/cache-corsairs.jpg",
    "Algorithm Ahoy": "/lovable-uploads/algorithm-ahoy.jpg",
    "Hackbeard's Legacy": "/lovable-uploads/hackbeards-legacy.jpg",
    "Quantum Kraken": "/lovable-uploads/quantum-kraken.jpg"
  };

  // Use the mapped image if available, otherwise fall back to the provided imgSrc
  const imageSource = gameImageMap[game.title] || game.imgSrc;

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
                // Fall back to the original image source if the mapped one fails
                const target = e.target as HTMLImageElement;
                if (target.src !== game.imgSrc) {
                  target.src = game.imgSrc;
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
