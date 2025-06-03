
import { ScrollArea } from "@/components/ui/scroll-area";
import GameTile from './GameTile';
import { ChevronLeft, ChevronRight, SortAsc, SortDesc } from 'lucide-react';
import { useState, useEffect } from 'react';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { useAuth } from "@/hooks/useSimpleAuth";
import { Game } from '@/data/games';
import { Button } from "@/components/ui/button";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { games as localGames } from '@/data/games';

const GameGrid = () => {
  const { checkIfGameUnlocked } = useAuth();
  // Emergency fix: Load games synchronously from local data
  const [games, setGames] = useState<Game[]>(() => {
    return localGames.map(game => ({
      ...game,
      coinCost: game.coinCost < 10 ? Math.floor(Math.random() * 41) + 10 : game.coinCost,
      unlocked: false
    }));
  });
  const [sortByPrice, setSortByPrice] = useState<'asc' | 'desc' | null>(null);
  
  // Remove all async loading - games are available immediately
  useEffect(() => {
    console.log(`GameGrid: ${games.length} games loaded immediately (emergency mode)`);
  }, [games.length]);
  
  const handleSort = () => {
    if (sortByPrice === null || sortByPrice === 'desc') {
      setSortByPrice('asc');
    } else {
      setSortByPrice('desc');
    }
  };
  
  const sortedGames = [...games].sort((a, b) => {
    if (sortByPrice === 'asc') {
      return a.coinCost - b.coinCost;
    } else if (sortByPrice === 'desc') {
      return b.coinCost - a.coinCost;
    }
    return 0;
  });
  
  const allCategories = [
    'fps', 'action', 'adventure', 'rpg', 'strategy', 
    'puzzle', 'indie', 'classic', 'party', 'horror', 
    'battle-royale', 'moba', 'sports', 'sandbox', 
    'mmorpg', 'card'
  ];
  
  const categoryGroups: Record<string, Game[]> = {};
  
  allCategories.forEach(category => {
    const gamesInCategory = sortedGames.filter(game => game.category === category);
    if (gamesInCategory.length > 0) {
      categoryGroups[category] = gamesInCategory;
    }
  });
  
  const featuredGames = sortedGames.slice(0, 8);
  
  const getCategoryDisplayName = (category: string): string => {
    const categoryMap: Record<string, string> = {
      'fps': 'FPS & Shooters',
      'action': 'Action Games',
      'adventure': 'Adventure Games',
      'rpg': 'RPG Games',
      'strategy': 'Strategy Games',
      'puzzle': 'Puzzle Games',
      'indie': 'Indie Games',
      'classic': 'Classic Games',
      'party': 'Party Games',
      'horror': 'Horror Games',
      'battle-royale': 'Battle Royale',
      'moba': 'MOBA Games',
      'sports': 'Sports Games',
      'sandbox': 'Sandbox Games',
      'mmorpg': 'MMORPGs',
      'card': 'Card Games'
    };
    
    return categoryMap[category] || `${category.charAt(0).toUpperCase()}${category.slice(1)} Games`;
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Featured Collection section */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-gray-500 text-sm font-medium uppercase tracking-wider">01 / Collections</span>
            <h2 className="text-2xl md:text-3xl font-bold text-black mt-1">THE COLLECTION</h2>
          </div>
          
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSort}
                className="flex items-center gap-2"
              >
                Sort by Price
                {sortByPrice === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-auto">
              <p className="text-sm">
                {sortByPrice === 'asc' 
                  ? 'Sorting from lowest to highest price' 
                  : 'Sorting from highest to lowest price'}
              </p>
            </HoverCardContent>
          </HoverCard>
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
        {Object.entries(categoryGroups).map(([category, gamesInCategory]) => (
          <div key={category} className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">{getCategoryDisplayName(category)}</h3>
            </div>
            <Carousel className="w-full relative">
              <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent z-10"></div>
              <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent z-10"></div>
              
              <CarouselContent>
                {gamesInCategory.map((game) => (
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
        ))}
      </div>
    </div>
  );
};

export default GameGrid;
