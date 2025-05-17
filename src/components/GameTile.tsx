
import { useState } from 'react';
import { Game } from '@/data/games';
import SecretCodeModal from './SecretCodeModal';

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
        <div className="overflow-hidden rounded-xl border-2 border-transparent transition-all duration-200 hover:border-netflix-red hover:scale-105 hover:shadow-lg bg-gradient-to-br from-black/40 to-black/10">
          <div className="relative">
            <img 
              src={game.imgSrc} 
              alt={game.title}
              className="w-full h-full aspect-[3/4] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-50"></div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full p-2 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-xl">
          <h3 className="text-white text-center text-stroke font-bold text-sm">
            {game.title}
          </h3>
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
