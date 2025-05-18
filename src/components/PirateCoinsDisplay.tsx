
import { useAuth } from "@/hooks/useAuth";
import { Coins } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";

interface PirateCoinsDisplayProps {
  size?: "small" | "medium" | "large";
  showTooltip?: boolean;
}

const PirateCoinsDisplay = ({ size = "medium", showTooltip = true }: PirateCoinsDisplayProps) => {
  const { pirateCoins, currentUser } = useAuth();
  const [displayCoins, setDisplayCoins] = useState(pirateCoins);
  
  useEffect(() => {
    // Update the display coins whenever pirateCoins changes
    setDisplayCoins(pirateCoins);
    
    // Make sure we're getting the latest coins from localStorage
    if (currentUser) {
      const storedCoins = localStorage.getItem(`pirateCoins`);
      if (storedCoins) {
        setDisplayCoins(parseInt(storedCoins));
      }
    }
  }, [pirateCoins, currentUser]);
  
  const containerClasses = {
    small: "flex items-center gap-1 text-sm",
    medium: "flex items-center gap-2",
    large: "flex items-center gap-2 text-lg"
  };
  
  const iconSizes = {
    small: 14,
    medium: 16,
    large: 20
  };

  const displayElement = (
    <div className={`${containerClasses[size]} hover:scale-105 transition-transform`}>
      <Coins size={iconSizes[size]} className="text-yellow-500" />
      <span className="font-medium">{displayCoins}</span>
    </div>
  );
  
  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {displayElement}
          </TooltipTrigger>
          <TooltipContent>
            <p>Your Pirate Coin balance</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return displayElement;
};

export default PirateCoinsDisplay;
