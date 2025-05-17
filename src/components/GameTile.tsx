
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
        <div className="game-tile-frame">
          <div className="relative">
            <img 
              src={game.imgSrc} 
              alt={game.title}
              className="w-full h-full aspect-[3/2] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-pirate-background/80 via-pirate-background/20 to-transparent opacity-60"></div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full p-2 bg-gradient-to-t from-pirate-secondary/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-3xl">
          <h3 className="text-pirate-text text-center font-bold text-sm">
            {game.title}
          </h3>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-40 rounded-3xl pointer-events-none transition-opacity"></div>
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
