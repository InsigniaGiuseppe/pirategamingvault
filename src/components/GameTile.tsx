
import { useState } from 'react';
import { Game } from '@/data/games';
import SecretCodeModal from './SecretCodeModal';
import { Tag, Info, Lock, Coins, ExternalLink } from 'lucide-react';
import { useAuth } from '@/hooks/useSimpleAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const PAYMENT_LINK = "https://checkout.revolut.com/pay/4b623f7a-5dbc-400c-9291-ff34c4258654";

interface GameTileProps {
  game: Game;
}

const GameTile = ({ game }: GameTileProps) => {
  const [showModal, setShowModal] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const { pirateCoins, addPirateCoins, checkIfGameUnlocked, unlockGame } = useAuth();
  const { toast } = useToast();
  
  const canAfford = pirateCoins >= game.coinCost;
  
  const handleUnlock = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!canAfford) {
      toast({
        title: "Not Enough Coins",
        description: `You need ${game.coinCost - pirateCoins} more coins to unlock this game!`,
        action: (
          <Button 
            size="sm"
            variant="payment"
            onClick={() => window.open(PAYMENT_LINK, '_blank')}
          >
            <ExternalLink size={14} className="mr-1" />
            Buy Coins
          </Button>
        )
      });
      return;
    }
    
    setIsUnlocking(true);
    
    try {
      await unlockGame(game.id, game.coinCost);
      
      setTimeout(() => {
        setIsUnlocking(false);
        toast({
          title: "Game Unlocked!",
          description: `You've successfully unlocked ${game.title}.`
        });
      }, 1000);
    } catch (error) {
      setIsUnlocking(false);
      toast({
        variant: "destructive",
        title: "Error Unlocking Game",
        description: "Something went wrong. Please try again."
      });
    }
  };
  
  const isUnlocked = checkIfGameUnlocked(game.id);

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  const getImageSource = (game: Game) => {
    if (game.imgSrc) {
      return game.imgSrc;
    }
    
    const gameTitleForUrl = encodeURIComponent(game.title.toLowerCase().replace(/\s+/g, '%20'));
    return `https://static-cdn.jtvnw.net/ttv-boxart/${gameTitleForUrl}-285x380.jpg`;
  };

  const imageSource = getImageSource(game);

  const handleGameClick = () => {
    if (isUnlocked) {
      setShowModal(true);
    } else {
      toast({
        title: "Game Locked",
        description: `This game costs ${game.coinCost} Pirate Coins to unlock.`,
        action: (
          <Button 
            size="sm"
            variant="payment"
            onClick={() => window.open(PAYMENT_LINK, '_blank')}
          >
            <ExternalLink size={14} className="mr-1" />
            Get Coins
          </Button>
        )
      });
    }
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <div 
              className={`relative cursor-pointer group transition-transform duration-200 hover:scale-105 ${!isUnlocked ? 'opacity-90' : ''}`}
              onClick={handleGameClick}
            >
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative h-full">
                  {isImageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  
                  <div className="relative">
                    <img 
                      src={imageSource} 
                      alt={game.title}
                      className={`w-full h-full aspect-[16/9] object-cover rounded-t-lg ${!isUnlocked ? 'grayscale brightness-75' : ''} transition-all duration-200 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                      onLoad={handleImageLoad}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (!target.src.includes('picsum.photos')) {
                          target.src = `https://picsum.photos/seed/${encodeURIComponent(game.title.toLowerCase().replace(/\s+/g, '-'))}/600/800`;
                          setIsImageLoading(false);
                        }
                      }}
                    />
                    
                    {!isUnlocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity">
                        <Lock size={32} className="text-white opacity-80" />
                      </div>
                    )}
                  </div>
                  
                  <div className="absolute top-3 left-3 bg-black/90 px-2 py-1 rounded text-xs font-heading text-white flex items-center">
                    <Tag size={12} className="mr-1" />
                    {game.title}
                  </div>
                  
                  <div className="absolute top-3 right-3 bg-black/90 px-2 py-1 rounded text-xs font-heading text-white flex items-center">
                    <Coins size={12} className="mr-1 text-yellow-500" />
                    {game.coinCost}
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-center">
                    <span className="text-white text-sm font-medium truncate">{game.title}</span>
                    {!isUnlocked ? (
                      <Button 
                        onClick={handleUnlock}
                        size="sm"
                        variant="outline"
                        disabled={!canAfford || isUnlocking}
                        className="h-7 rounded-full px-2 flex items-center gap-1 bg-white/90 border-yellow-500 text-black hover:bg-blue-600 hover:text-white hover:border-blue-600"
                      >
                        <Lock size={12} className="text-yellow-500" />
                        <span>{isUnlocking ? '...' : 'Unlock'}</span>
                      </Button>
                    ) : (
                      <div className="bg-white text-black rounded-full w-6 h-6 flex items-center justify-center">
                        <Info size={14} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{isUnlocked ? "Click to view game details" : "Unlock with Pirate Coins to play!"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <SecretCodeModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        gameTitle={game.title}
      />
    </>
  );
};

export default GameTile;
