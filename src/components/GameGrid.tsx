
import { ScrollArea } from "@/components/ui/scroll-area";
import { games } from '@/data/games';
import GameTile from './GameTile';
import { ChevronRight, X } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { useState } from 'react';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { useAuth } from "@/hooks/useAuth";

const GameGrid = () => {
  const [showAllGames, setShowAllGames] = useState(false);
  const { checkIfGameUnlocked } = useAuth();
  
  // Filter games to show first 8 for the featured section
  const featuredGames = games.slice(0, 8);
  
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Featured Collection section */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-gray-500 text-sm font-medium uppercase tracking-wider">01 / Collections</span>
            <h2 className="text-2xl md:text-3xl font-bold text-black mt-1">Featured Collection</h2>
          </div>
          <button 
            onClick={() => setShowAllGames(!showAllGames)} 
            className="flex items-center text-gray-500 hover:text-black transition-colors text-sm font-medium"
          >
            {showAllGames ? 'Hide All' : 'View All'} <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
        
        {/* Featured Games - Horizontal Scrolling */}
        <ScrollArea className="w-full whitespace-nowrap pb-4">
          <div className="inline-flex gap-6 px-1">
            {featuredGames.map((game) => (
              <div key={game.id} className="w-[200px] inline-block">
                <GameTile game={game} />
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Full Game Collection (Netflix-style) - Shows when View All is clicked */}
        {showAllGames && (
          <div className="fixed inset-0 bg-white z-50 p-6 overflow-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">All Games</h2>
              <button 
                onClick={() => setShowAllGames(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-12">
              {/* Group games by category */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Action Games</h3>
                <Carousel className="w-full">
                  <CarouselContent>
                    {games.filter(game => game.category === 'action').map((game) => (
                      <CarouselItem key={game.id} className="basis-1/4 md:basis-1/5 lg:basis-1/6">
                        <GameTile game={game} />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-1" />
                  <CarouselNext className="right-1" />
                </Carousel>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Adventure Games</h3>
                <Carousel className="w-full">
                  <CarouselContent>
                    {games.filter(game => game.category === 'adventure').map((game) => (
                      <CarouselItem key={game.id} className="basis-1/4 md:basis-1/5 lg:basis-1/6">
                        <GameTile game={game} />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-1" />
                  <CarouselNext className="right-1" />
                </Carousel>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-semibold">RPG & Strategy</h3>
                <Carousel className="w-full">
                  <CarouselContent>
                    {games.filter(game => game.category === 'rpg' || game.category === 'strategy').map((game) => (
                      <CarouselItem key={game.id} className="basis-1/4 md:basis-1/5 lg:basis-1/6">
                        <GameTile game={game} />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-1" />
                  <CarouselNext className="right-1" />
                </Carousel>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Other Games</h3>
                <Carousel className="w-full">
                  <CarouselContent>
                    {games.filter(game => 
                      !['action', 'adventure', 'rpg', 'strategy'].includes(game.category || '')
                    ).map((game) => (
                      <CarouselItem key={game.id} className="basis-1/4 md:basis-1/5 lg:basis-1/6">
                        <GameTile game={game} />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-1" />
                  <CarouselNext className="right-1" />
                </Carousel>
              </div>
            </div>
          </div>
        )}
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
