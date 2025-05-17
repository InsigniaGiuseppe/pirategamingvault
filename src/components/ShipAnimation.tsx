
import { Ship } from 'lucide-react';

const ShipAnimation = () => {
  return (
    <div className="relative w-full h-24 mb-8">
      <div className="absolute w-full h-1 bg-gray-200 top-12 left-0">
        <div className="w-full h-full relative overflow-hidden">
          {/* Wave path for the ship to follow */}
          <svg width="100%" height="20" className="absolute top-0 left-0">
            <path
              d="M0,10 Q25,5 50,10 T100,10 T150,10 T200,10"
              stroke="#111111"
              strokeWidth="1"
              fill="none"
              strokeDasharray="3,3"
            />
          </svg>
          
          {/* Realistic ship icon */}
          <div className="animate-ship-sailing">
            <Ship className="h-10 w-10 text-black transform -translate-y-6 rotate-0" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipAnimation;
