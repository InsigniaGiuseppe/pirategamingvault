
import { games } from '@/data/games';
import GameTile from './GameTile';
import { ChevronRight } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';

const GameGrid = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Featured Collection section */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-saas-grey-400 text-sm font-medium uppercase tracking-wider">01 / Collections</span>
            <h2 className="text-2xl md:text-3xl font-bold text-saas-lavender mt-1">Featured Collection</h2>
          </div>
          <a href="#" className="flex items-center text-saas-grey-400 hover:text-saas-lavender transition-colors text-sm font-medium">
            View all <ChevronRight size={16} className="ml-1" />
          </a>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {games.map((game) => (
            <GameTile key={game.id} game={game} />
          ))}
        </div>
      </div>
      
      {/* Social proof section */}
      <div className="mb-16">
        <div className="text-center mb-10">
          <span className="text-saas-grey-400 text-sm font-medium uppercase tracking-wider">02 / Testimonials</span>
          <h2 className="text-2xl md:text-3xl font-bold text-saas-lavender mt-1">Trusted by Gamers</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="saas-card">
            <div className="flex items-start gap-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src="/lovable-uploads/af98a0d6-151c-48ff-a3e9-025a40fb5669.png" alt="TheBananaOrder" />
                <AvatarFallback className="bg-saas-grey-200">TB</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-saas-grey-800 italic mb-3">"PIRATE GAMING VAULT has completely transformed how I manage my game library. The interface is intuitive and the download speeds are incredible."</p>
                <p className="text-saas-grey-600 font-medium">TheBananaOrder, Quartermaster</p>
              </div>
            </div>
          </div>
          
          <div className="saas-card">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-saas-grey-200 flex items-center justify-center">
                <span className="text-saas-grey-500 font-bold">JS</span>
              </div>
              <div>
                <p className="text-saas-grey-800 italic mb-3">"As a game developer, I appreciate the attention to detail in the PIRATE GAMING platform. It showcases our games beautifully."</p>
                <p className="text-saas-grey-600 font-medium">Jane Smith, Game Developer</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameGrid;
