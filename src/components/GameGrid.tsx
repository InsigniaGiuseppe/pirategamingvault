
import { ScrollArea } from "@/components/ui/scroll-area";
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
            <span className="text-gray-500 text-sm font-medium uppercase tracking-wider">01 / Collections</span>
            <h2 className="text-2xl md:text-3xl font-bold text-black mt-1">Featured Collection</h2>
          </div>
          <a href="#" className="flex items-center text-gray-500 hover:text-black transition-colors text-sm font-medium">
            View all <ChevronRight size={16} className="ml-1" />
          </a>
        </div>
        
        <ScrollArea className="w-full whitespace-nowrap pb-4">
          <div className="inline-flex gap-6 px-1">
            {games.map((game) => (
              <div key={game.id} className="w-[200px] inline-block">
                <GameTile game={game} />
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
      
      {/* Social proof section with left-aligned heading */}
      <div className="mb-16">
        <div className="flex items-start justify-between mb-8">
          <div>
            <span className="text-gray-500 text-sm font-medium uppercase tracking-wider">02 / Testimonials</span>
            <h2 className="text-2xl md:text-3xl font-bold text-black mt-1">Trusted by Gamers</h2>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="saas-card">
            <div className="flex items-start gap-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src="/lovable-uploads/af98a0d6-151c-48ff-a3e9-025a40fb5669.png" alt="TheBananaOrder" />
                <AvatarFallback className="bg-gray-200">TB</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-black italic mb-3">"PIRATE GAMING VAULT has completely transformed how I manage my game library. The interface is intuitive and the download speeds are incredible."</p>
                <p className="text-gray-600 font-medium">TheBananaOrder, Quartermaster</p>
              </div>
            </div>
          </div>
          
          <div className="saas-card">
            <div className="flex items-start gap-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src="/lovable-uploads/ae48e00f-9a3a-414c-ba60-3c1099f45e2a.png" alt="Dean V" />
                <AvatarFallback className="bg-gray-200">DV</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-black italic mb-3">"As a game developer, I appreciate the attention to detail in the PIRATE GAMING platform. It showcases our games beautifully."</p>
                <p className="text-gray-600 font-medium">Dean V, Full Time Content Creator</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameGrid;
