
import { ScrollArea } from "@/components/ui/scroll-area";
import { games } from '@/data/games';
import GameTile from './GameTile';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { useState } from 'react';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/useAuth";

const GameGrid = () => {
  const { checkIfGameUnlocked } = useAuth();
  
  // Group games by category
  const actionGames = games.filter(game => game.category === 'action');
  const adventureGames = games.filter(game => game.category === 'adventure');
  const rpgStrategyGames = games.filter(game => 
    game.category === 'rpg' || game.category === 'strategy'
  );
  const otherGames = games.filter(game => 
    !['action', 'adventure', 'rpg', 'strategy'].includes(game.category || '')
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
        <Carousel className="w-full">
          <CarouselContent>
            {featuredGames.map((game) => (
              <CarouselItem key={game.id} className="basis-1/2 md:basis-1/3 lg:basis-1/4">
                <GameTile game={game} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-1">
            <ChevronLeft className="h-4 w-4" />
          </CarouselPrevious>
          <CarouselNext className="right-1">
            <ChevronRight className="h-4 w-4" />
          </CarouselNext>
        </Carousel>
      </div>

      {/* Game Categories - Netflix Style Layout */}
      <div className="space-y-16">
        {actionGames.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Action Games</h3>
            </div>
            <Carousel className="w-full">
              <CarouselContent>
                {actionGames.map((game) => (
                  <CarouselItem key={game.id} className="basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <GameTile game={game} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-1">
                <ChevronLeft className="h-4 w-4" />
              </CarouselPrevious>
              <CarouselNext className="right-1">
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
            <Carousel className="w-full">
              <CarouselContent>
                {adventureGames.map((game) => (
                  <CarouselItem key={game.id} className="basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <GameTile game={game} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-1">
                <ChevronLeft className="h-4 w-4" />
              </CarouselPrevious>
              <CarouselNext className="right-1">
                <ChevronRight className="h-4 w-4" />
              </CarouselNext>
            </Carousel>
          </div>
        )}

        {rpgStrategyGames.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">RPG & Strategy</h3>
            </div>
            <Carousel className="w-full">
              <CarouselContent>
                {rpgStrategyGames.map((game) => (
                  <CarouselItem key={game.id} className="basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <GameTile game={game} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-1">
                <ChevronLeft className="h-4 w-4" />
              </CarouselPrevious>
              <CarouselNext className="right-1">
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
            <Carousel className="w-full">
              <CarouselContent>
                {otherGames.map((game) => (
                  <CarouselItem key={game.id} className="basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <GameTile game={game} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-1">
                <ChevronLeft className="h-4 w-4" />
              </CarouselPrevious>
              <CarouselNext className="right-1">
                <ChevronRight className="h-4 w-4" />
              </CarouselNext>
            </Carousel>
          </div>
        )}
      </div>
      
      {/* Social proof section */}
      <div className="mt-24 mb-16">
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
