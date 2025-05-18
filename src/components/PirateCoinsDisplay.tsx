
import { useAuth } from "@/hooks/useAuth";
import { Coins } from "lucide-react";

interface PirateCoinsDisplayProps {
  size?: "small" | "medium" | "large";
}

const PirateCoinsDisplay = ({ size = "medium" }: PirateCoinsDisplayProps) => {
  const { pirateCoins } = useAuth();
  
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
  
  return (
    <div className={containerClasses[size]}>
      <Coins size={iconSizes[size]} className="text-yellow-500" />
      <span className="font-medium">{pirateCoins}</span>
    </div>
  );
};

export default PirateCoinsDisplay;
