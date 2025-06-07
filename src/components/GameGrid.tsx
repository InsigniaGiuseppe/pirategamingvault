
import GameTile from './GameTile';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { useSimpleAuth } from "@/hooks/useSimpleAuth";
import { Game } from '@/data/games';
import { games as localGames } from '@/data/games';
import { featuredGames } from '@/data/featuredGames';
import GameSearch from './GameSearch';

const GameGrid = () => {
  const { checkIfGameUnlocked } = useSimpleAuth();
  const [games, setGames] = useState<Game[]>(() => {
    return localGames.map(game => ({
      ...game,
      unlocked: false
    }));
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  useEffect(() => {
    console.log(`GameGrid: ${games.length} games loaded immediately`);
  }, [games.length]);
  
  const availableCategories = useMemo(() => {
    const categories = [...new Set(games.map(game => game.category).filter(Boolean))];
    return categories.sort();
  }, [games]);
  
  const filteredGames = useMemo(() => {
    return games.filter(game => {
      const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 || 
        (game.category && selectedCategories.includes(game.category));
      return matchesSearch && matchesCategory;
    });
  }, [games, searchTerm, selectedCategories]);
  
  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Featured Games section */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-gray-500 text-sm font-medium uppercase tracking-wider flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              00 / Featured
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-black mt-1">TRENDING NOW</h2>
            <p className="text-gray-600 mt-2">The hottest games everyone is playing</p>
          </div>
        </div>
        
        <Carousel className="w-full relative">
          <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent z-10"></div>
          <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent z-10"></div>
          
          <CarouselContent>
            {featuredGames.map((game) => (
              <CarouselItem key={game.id} className="basis-full md:basis-1/2 lg:basis-1/3 xl:basis-1/4 p-2">
                <div className="relative">
                  <div className="absolute -top-2 -right-2 z-10">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                      NEW
                    </div>
                  </div>
                  <GameTile game={game} />
                </div>
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

      {/* Main Collection section with Search */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-gray-500 text-sm font-medium uppercase tracking-wider">01 / Collections</span>
            <h2 className="text-2xl md:text-3xl font-bold text-black mt-1">THE COLLECTION</h2>
          </div>
        </div>
        
        <GameSearch
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategories={selectedCategories}
          onCategoryToggle={handleCategoryToggle}
          availableCategories={availableCategories}
          gameCount={filteredGames.length}
        />
        
        {/* Dense Grid Layout */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {filteredGames.map((game) => (
            <div key={game.id} className="w-full">
              <GameTile game={game} />
            </div>
          ))}
        </div>
        
        {filteredGames.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No games found matching your criteria.</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameGrid;
