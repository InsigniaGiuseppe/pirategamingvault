
import { Ship } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ShipAnimationProps {
  progress: number;
}

const ShipAnimation: React.FC<ShipAnimationProps> = ({ progress }) => {
  const [position, setPosition] = useState(0);
  
  useEffect(() => {
    // Update ship position based on progress
    setPosition(progress);
  }, [progress]);
  
  return (
    <div className="relative w-80 h-16 mb-4">
      <div className="absolute bottom-0 w-full h-1 bg-gray-200 rounded-full" />
      <div 
        className="absolute -translate-y-1/2" 
        style={{ 
          left: `${position}%`, 
          transform: `translateX(-50%) translateY(-50%)` 
        }}
      >
        <Ship className="text-black h-8 w-8" />
      </div>
    </div>
  );
};

export default ShipAnimation;
