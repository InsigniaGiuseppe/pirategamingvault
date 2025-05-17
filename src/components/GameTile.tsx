
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
        <div className="game-tile transition-all duration-300 aspect-video">
          <div className="relative h-full">
            <img 
              src={game.imgSrc} 
              alt={game.title}
              className="w-full h-full aspect-[16/9] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-digital-background/80 via-digital-background/20 to-transparent"></div>
            <div className="absolute top-3 left-3 bg-digital-panel/30 backdrop-blur-sm px-2 py-1 rounded-md border border-digital-primary/20 text-xs font-space text-digital-primary">
              {game.title}
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-digital-primary/5 to-digital-secondary/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity"></div>
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-digital-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-b-2xl flex justify-center items-center">
          <span className="bg-digital-primary/20 border border-digital-primary/30 text-digital-primary px-3 py-1 rounded-full text-xs font-space">
            Explore
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
