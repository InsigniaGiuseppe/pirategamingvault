
import { games } from '@/data/games';
import GameTile from './GameTile';

const GameGrid = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-netflix-red/20 to-transparent p-1 mb-6 rounded-lg"></div>
      <h2 className="text-2xl font-bold text-white mb-6 shadow-sm">Featured Plunder</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {games.map((game) => (
          <GameTile key={game.id} game={game} />
        ))}
      </div>
      
      <div className="bg-gradient-to-r from-netflix-red/20 to-transparent p-1 my-6 rounded-lg"></div>
      <h2 className="text-2xl font-bold text-white mb-6 shadow-sm">Crew Favorites</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {games.filter(game => !game.isPiratePun).slice(0, 5).map((game) => (
          <GameTile key={`fav-${game.id}`} game={game} />
        ))}
      </div>
    </div>
  );
};

export default GameGrid;
