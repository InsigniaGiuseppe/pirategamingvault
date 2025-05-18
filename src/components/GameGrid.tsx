
import { ScrollArea } from "@/components/ui/scroll-area";
import { games } from '@/data/games';
import GameTile from './GameTile';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  const { checkIfGameUnlocked } = useAuth();
  
  // Group games by category
  const actionGames = games.filter(game => game.category === 'action');
  const adventureGames = games.filter(game => game.category === 'adventure');
  const fpsGames = games.filter(game => game.category === 'fps');
  const rpgGames = games.filter(game => game.category === 'rpg');
  const strategyGames = games.filter(game => game.category === 'strategy');
  const otherGames = games.filter(game => 
    !['action', 'adventure', 'fps', 'rpg', 'strategy'].includes(game.category || '')
  );
  
  // Create featured games section (first 8 games)
  const featuredGames = games.slice(0, 8);
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Featured Collection section */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-gray-500 text-sm font-medium uppercase tracking-wider">01 / Collections</span>
            <h2 className="text-2xl md:text-3xl font-bold text-black mt-1">Featured Collection</h2>
          </div>
        </div>
        
        {/* Featured Games - Netflix Style Carousel */}
        <Carousel className="w-full relative">
          <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent z-10"></div>
          <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent z-10"></div>
          
          <CarouselContent>
            {featuredGames.map((game) => (
              <CarouselItem key={game.id} className="basis-full md:basis-1/2 lg:basis-1/3 xl:basis-1/4 p-2">
                <GameTile game={game} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-6 z-20 bg-white/80 hover:bg-white border border-gray-200">
            <ChevronLeft className="h-4 w-4" />
          </CarouselPrevious>
          <CarouselNext className="right-6 z-20 bg-white/80 hover:bg-white border border-gray-200">
            <ChevronRight className="h-4 w-4" />
          </CarouselNext>
        </Carousel>
      </div>

      {/* Game Categories - Netflix Style Layout */}
      <div className="space-y-16">
        {fpsGames.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">FPS & Shooters</h3>
            </div>
            <Carousel className="w-full relative">
              <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent z-10"></div>
              <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent z-10"></div>
              
              <CarouselContent>
                {fpsGames.map((game) => (
                  <CarouselItem key={game.id} className="basis-full md:basis-1/2 lg:basis-1/3 xl:basis-1/4 p-2">
                    <GameTile game={game} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-6 z-20 bg-white/80 hover:bg-white border border-gray-200">
                <ChevronLeft className="h-4 w-4" />
              </CarouselPrevious>
              <CarouselNext className="right-6 z-20 bg-white/80 hover:bg-white border border-gray-200">
                <ChevronRight className="h-4 w-4" />
              </CarouselNext>
            </Carousel>
          </div>
        )}

        {actionGames.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Action Games</h3>
            </div>
            <Carousel className="w-full relative">
              <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent z-10"></div>
              <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent z-10"></div>
              
              <CarouselContent>
                {actionGames.map((game) => (
                  <CarouselItem key={game.id} className="basis-full md:basis-1/2 lg:basis-1/3 xl:basis-1/4 p-2">
                    <GameTile game={game} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-6 z-20 bg-white/80 hover:bg-white border border-gray-200">
                <ChevronLeft className="h-4 w-4" />
              </CarouselPrevious>
              <CarouselNext className="right-6 z-20 bg-white/80 hover:bg-white border border-gray-200">
                <ChevronRight className="h-4 w-4" />
              </CarouselNext>
            </Carousel>
          </div>
        )}

        {adventureGames.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Adventure Games</h3>
            </div>
            <Carousel className="w-full relative">
              <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent z-10"></div>
              <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent z-10"></div>
              
              <CarouselContent>
                {adventureGames.map((game) => (
                  <CarouselItem key={game.id} className="basis-full md:basis-1/2 lg:basis-1/3 xl:basis-1/4 p-2">
                    <GameTile game={game} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-6 z-20 bg-white/80 hover:bg-white border border-gray-200">
                <ChevronLeft className="h-4 w-4" />
              </CarouselPrevious>
              <CarouselNext className="right-6 z-20 bg-white/80 hover:bg-white border border-gray-200">
                <ChevronRight className="h-4 w-4" />
              </CarouselNext>
            </Carousel>
          </div>
        )}

        {rpgGames.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">RPG Games</h3>
            </div>
            <Carousel className="w-full relative">
              <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent z-10"></div>
              <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent z-10"></div>
              
              <CarouselContent>
                {rpgGames.map((game) => (
                  <CarouselItem key={game.id} className="basis-full md:basis-1/2 lg:basis-1/3 xl:basis-1/4 p-2">
                    <GameTile game={game} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-6 z-20 bg-white/80 hover:bg-white border border-gray-200">
                <ChevronLeft className="h-4 w-4" />
              </CarouselPrevious>
              <CarouselNext className="right-6 z-20 bg-white/80 hover:bg-white border border-gray-200">
                <ChevronRight className="h-4 w-4" />
              </CarouselNext>
            </Carousel>
          </div>
        )}

        {strategyGames.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Strategy Games</h3>
            </div>
            <Carousel className="w-full relative">
              <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent z-10"></div>
              <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent z-10"></div>
              
              <CarouselContent>
                {strategyGames.map((game) => (
                  <CarouselItem key={game.id} className="basis-full md:basis-1/2 lg:basis-1/3 xl:basis-1/4 p-2">
                    <GameTile game={game} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-6 z-20 bg-white/80 hover:bg-white border border-gray-200">
                <ChevronLeft className="h-4 w-4" />
              </CarouselPrevious>
              <CarouselNext className="right-6 z-20 bg-white/80 hover:bg-white border border-gray-200">
                <ChevronRight className="h-4 w-4" />
              </CarouselNext>
            </Carousel>
          </div>
        )}

        {otherGames.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Other Games</h3>
            </div>
            <Carousel className="w-full relative">
              <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent z-10"></div>
              <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent z-10"></div>
              
              <CarouselContent>
                {otherGames.map((game) => (
                  <CarouselItem key={game.id} className="basis-full md:basis-1/2 lg:basis-1/3 xl:basis-1/4 p-2">
                    <GameTile game={game} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-6 z-20 bg-white/80 hover:bg-white border border-gray-200">
                <ChevronLeft className="h-4 w-4" />
              </CarouselPrevious>
              <CarouselNext className="right-6 z-20 bg-white/80 hover:bg-white border border-gray-200">
                <ChevronRight className="h-4 w-4" />
              </CarouselNext>
            </Carousel>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameGrid;
