
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
        className="relative cursor-pointer group"
        onClick={() => setShowModal(true)}
      >
        <div className="saas-game-tile">
          <div className="relative h-full">
            <img 
              src={game.imgSrc} 
              alt={game.title}
              className="w-full h-full aspect-[16/9] object-cover rounded-t-lg"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-saas-navy/80 to-transparent"></div>
            
            <div className="absolute top-3 left-3 bg-saas-teal/90 px-2 py-1 rounded text-xs font-heading text-saas-navy flex items-center">
              <Tag size={12} className="mr-1" />
              {game.title}
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-between items-center">
              <span className="text-white text-sm font-medium truncate">{game.title}</span>
              <div className="bg-saas-grey-100/90 text-saas-grey-800 rounded-full w-6 h-6 flex items-center justify-center">
                <Info size={14} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute inset-x-0 bottom-0 h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-saas-teal/10 rounded-lg">
          <span className="bg-saas-teal text-saas-navy font-medium px-4 py-2 rounded-md flex items-center gap-2 shadow-saas-primary">
            View Details
          </span>
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
