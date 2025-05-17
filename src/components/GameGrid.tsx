
import { games } from '@/data/games';
import GameTile from './GameTile';

const GameGrid = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-digital-primary/20 to-transparent p-0.5 mb-6 rounded-full"></div>
      <h2 className="text-2xl font-bold text-digital-primary mb-6 font-space">Featured Collection</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {games.map((game) => (
          <GameTile key={game.id} game={game} />
        ))}
      </div>
      
      <div className="bg-gradient-to-r from-digital-primary/20 to-transparent p-0.5 my-6 rounded-full"></div>
      <h2 className="text-2xl font-bold text-digital-primary mb-6 font-space">Community Favorites</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {games.filter(game => !game.isPiratePun).slice(0, 5).map((game) => (
          <GameTile key={`fav-${game.id}`} game={game} />
        ))}
      </div>
    </div>
  );
};

export default GameGrid;
