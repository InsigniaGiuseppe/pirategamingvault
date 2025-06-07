
import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface GameSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategories: string[];
  onCategoryToggle: (category: string) => void;
  availableCategories: string[];
  gameCount: number;
}

const GameSearch = ({
  searchTerm,
  onSearchChange,
  selectedCategories,
  onCategoryToggle,
  availableCategories,
  gameCount
}: GameSearchProps) => {
  const [showFilters, setShowFilters] = useState(false);

  const categoryDisplayNames: Record<string, string> = {
    'fps': 'FPS',
    'action': 'Action',
    'adventure': 'Adventure',
    'rpg': 'RPG',
    'strategy': 'Strategy',
    'puzzle': 'Puzzle',
    'indie': 'Indie',
    'classic': 'Classic',
    'party': 'Party',
    'horror': 'Horror',
    'battle-royale': 'Battle Royale',
    'moba': 'MOBA',
    'sports': 'Sports',
    'sandbox': 'Sandbox',
    'mmorpg': 'MMORPG',
    'card': 'Card',
    'survival': 'Survival'
  };

  const clearAllFilters = () => {
    onSearchChange('');
    selectedCategories.forEach(cat => onCategoryToggle(cat));
  };

  return (
    <div className="space-y-4 mb-8">
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search games..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter size={16} />
          Filters
          {selectedCategories.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {selectedCategories.length}
            </Badge>
          )}
        </Button>
        {(searchTerm || selectedCategories.length > 0) && (
          <Button variant="ghost" onClick={clearAllFilters} size="sm">
            <X size={16} className="mr-1" />
            Clear
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium mb-3">Filter by Category</h4>
          <div className="flex flex-wrap gap-2">
            {availableCategories.map(category => (
              <Button
                key={category}
                variant={selectedCategories.includes(category) ? "default" : "outline"}
                size="sm"
                onClick={() => onCategoryToggle(category)}
                className="text-xs"
              >
                {categoryDisplayNames[category] || category}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="text-sm text-gray-600">
        Showing {gameCount} games
      </div>
    </div>
  );
};

export default GameSearch;
