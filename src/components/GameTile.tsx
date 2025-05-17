
import { useState } from 'react';
import { Game } from '@/data/games';
import SecretCodeModal from './SecretCodeModal';
import { Tag, Info } from 'lucide-react';

interface GameTileProps {
  game: Game;
}

const GameTile = ({ game }: GameTileProps) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div 
        className="relative cursor-pointer group transition-transform duration-200 hover:scale-105"
        onClick={() => setShowModal(true)}
      >
        <div className="bg-white/95 rounded-lg shadow-saas overflow-hidden hover:shadow-saas-primary transition-shadow duration-300">
          <div className="relative h-full">
            <img 
              src={game.imgSrc} 
              alt={game.title}
              className="w-full h-full aspect-[16/9] object-cover rounded-t-lg"
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
