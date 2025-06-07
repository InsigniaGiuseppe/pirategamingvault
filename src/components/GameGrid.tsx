
import OptimizedGameTile from './OptimizedGameTile';
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
import { Button } from './ui/button';

const GAMES_PER_PAGE = 24;

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
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    console.log(`GameGrid: ${games.length} games loaded`);
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

  const totalPages = Math.ceil(filteredGames.length / GAMES_PER_PAGE);
  const startIndex = (currentPage - 1) * GAMES_PER_PAGE;
  const endIndex = startIndex + GAMES_PER_PAGE;
  const currentPageGames = filteredGames.slice(startIndex, endIndex);
  
  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when search changes
  };

  const handlePageChange = (page: number) => {
    setIsLoading(true);
    setCurrentPage(page);
    
    // Smooth scroll to top of games section
    setTimeout(() => {
      const gamesSection = document.getElementById('games-collection');
      if (gamesSection) {
        gamesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setIsLoading(false);
    }, 100);
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
            {featuredGames.map((game, index) => (
              <CarouselItem key={game.id} className="basis-full md:basis-1/2 lg:basis-1/3 xl:basis-1/4 p-2">
                <div className="relative">
                  <div className="absolute -top-2 -right-2 z-10">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                      NEW
                    </div>
                  </div>
                  <OptimizedGameTile game={game} priority={index < 4} />
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
      <div className="mb-16" id="games-collection">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-gray-500 text-sm font-medium uppercase tracking-wider">01 / Collections</span>
            <h2 className="text-2xl md:text-3xl font-bold text-black mt-1">THE COLLECTION</h2>
          </div>
        </div>
        
        <GameSearch
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          selectedCategories={selectedCategories}
          onCategoryToggle={handleCategoryToggle}
          availableCategories={availableCategories}
          gameCount={filteredGames.length}
        />

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {/* Games Grid */}
        {!isLoading && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 mb-8">
              {currentPageGames.map((game, index) => (
                <div key={game.id} className="w-full">
                  <OptimizedGameTile 
                    game={game} 
                    priority={currentPage === 1 && index < 12} 
                  />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
        
        {filteredGames.length === 0 && !isLoading && (
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
