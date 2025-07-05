import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coins, Lock, Unlock, Play, ExternalLink, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from '@/hooks/useAuthState';
import type { Game } from '@/data/games';
import ErrorBoundary from './ErrorBoundary';

interface SafeOptimizedGameTileProps {
  game: Game;
}

const GameTileContent: React.FC<SafeOptimizedGameTileProps> = ({ game }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const mountedRef = useRef(true);
  const { toast } = useToast();
  
  // Safely get auth context with error handling
  let pirateCoins = 0;
  let unlockGame: ((gameId: string, cost: number) => Promise<boolean>) | null = null;
  let checkIfGameUnlocked: ((gameId: string) => boolean) | null = null;
  let isAuthenticated = false;
  let user = null;

  try {
    const auth = useAuthState();
    pirateCoins = auth?.pirateCoins || 0;
    isAuthenticated = auth?.isAuthenticated || false;
    user = auth?.user || null;
  } catch (error) {
    console.error('🔐 SafeOptimizedGameTile - Auth context error:', error);
  }
  
  const canAfford = pirateCoins >= (game.coinCost || 0);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (checkIfGameUnlocked && isAuthenticated) {
      try {
        const unlocked = checkIfGameUnlocked(game.id);
        setIsUnlocked(unlocked);
      } catch (error) {
        console.error('🔐 SafeOptimizedGameTile - Check unlock error:', error);
        setIsUnlocked(false);
      }
    }
  }, [game.id, checkIfGameUnlocked, isAuthenticated]);

  const handleUnlockClick = useCallback(async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to unlock games.",
        variant: "destructive",
      });
      return;
    }

    if (!canAfford) {
      toast({
        title: "Insufficient Coins",
        description: `You need ${game.coinCost} pirate coins to unlock this game.`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Mock unlock for now
      setTimeout(() => {
        if (mountedRef.current) {
          setIsUnlocked(true);
          toast({
            title: "Game Unlocked!",
            description: `${game.title} has been unlocked!`,
          });
          setIsLoading(false);
        }
      }, 800);
    } catch (error) {
      console.error('🔐 SafeOptimizedGameTile - Unlock error:', error);
      if (mountedRef.current) {
        toast({
          title: "Error",
          description: "An error occurred while unlocking the game.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    }
  }, [isAuthenticated, canAfford, game, toast]);

  const handlePlayClick = useCallback(() => {
    // Mock play action
    toast({
      title: "Game Launched!",
      description: `Playing ${game.title}...`,
    });
  }, [game.title, toast]);

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-secondary/20">
        <img 
          src={game.imgSrc} 
          alt={game.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Overlay badges */}
        <div className="absolute top-2 left-2 flex gap-2">
          {game.category && (
            <Badge variant="secondary" className="text-xs">
              {game.category}
            </Badge>
          )}
          <Badge className="bg-yellow-500 text-yellow-900 text-xs">
            <Coins className="w-3 h-3 mr-1" />
            {game.coinCost}
          </Badge>
        </div>

        {/* Lock/Unlock status */}
        <div className="absolute top-2 right-2">
          {isUnlocked ? (
            <div className="bg-green-500 text-white p-1.5 rounded-full">
              <Unlock className="w-4 h-4" />
            </div>
          ) : (
            <div className="bg-orange-500 text-white p-1.5 rounded-full">
              <Lock className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-1">{game.title}</h3>
            <p className="text-muted-foreground text-sm line-clamp-2 mt-1">
              {game.category} game
            </p>
          </div>

          {/* Game stats */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Category: {game.category}</span>
            <div className="flex items-center gap-1">
              <Coins className="w-4 h-4" />
              <span>{game.coinCost} coins</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            {isUnlocked ? (
              <Button 
                onClick={handlePlayClick}
                className="flex-1"
              >
                <Play className="w-4 h-4 mr-2" />
                Play Game
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleUnlockClick}
                disabled={isLoading || !canAfford || !isAuthenticated}
                className="flex-1"
                variant={canAfford ? "default" : "secondary"}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Unlocking...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    {canAfford ? 'Unlock Game' : 'Need More Coins'}
                  </>
                )}
              </Button>
            )}
          </div>

          {!isAuthenticated && (
            <p className="text-xs text-muted-foreground text-center">
              Log in to unlock and play games
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const GameTileErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <Card className="p-4">
    <div className="flex items-center gap-2 text-red-600 mb-2">
      <AlertTriangle size={16} />
      <span className="font-medium">Game Tile Error</span>
    </div>
    <p className="text-sm text-gray-600 mb-3">
      This game tile couldn't load properly.
    </p>
    <Button onClick={resetErrorBoundary} size="sm" variant="outline">
      Try Again
    </Button>
  </Card>
);

const SafeOptimizedGameTile: React.FC<SafeOptimizedGameTileProps> = ({ game }) => {
  return (
    <ErrorBoundary fallback={<GameTileErrorFallback error={new Error('Unknown error')} resetErrorBoundary={() => window.location.reload()} />}>
      <GameTileContent game={game} />
    </ErrorBoundary>
  );
};

export default SafeOptimizedGameTile;