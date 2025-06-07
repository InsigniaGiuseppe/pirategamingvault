
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, ExternalLink, CheckCircle, Play, Clock } from 'lucide-react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useToast } from '@/hooks/use-toast';

interface SimpleVideoWatcherProps {
  video: any;
  onCancel: () => void;
  onComplete: (coinsEarned: number) => void;
}

const SimpleVideoWatcher: React.FC<SimpleVideoWatcherProps> = ({ video, onCancel, onComplete }) => {
  const [isEarning, setIsEarning] = useState(false);
  const [timeWatched, setTimeWatched] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [showCoinAnimation, setShowCoinAnimation] = useState(false);
  const [nextRewardIn, setNextRewardIn] = useState(60);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const rewardTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { addPirateCoins } = useSimpleAuth();
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (rewardTimerRef.current) clearInterval(rewardTimerRef.current);
    };
  }, []);

  const startEarning = () => {
    console.log('Starting to earn coins for video:', video.title);
    setIsEarning(true);
    setTimeWatched(0);
    setCoinsEarned(0);
    setNextRewardIn(60);

    // Main timer - tracks seconds watched
    timerRef.current = setInterval(() => {
      setTimeWatched(prev => prev + 1);
    }, 1000);

    // Reward timer - gives coins every 60 seconds
    rewardTimerRef.current = setInterval(() => {
      setNextRewardIn(prev => {
        if (prev <= 1) {
          // Award coins
          const coinsToAward = 3;
          addPirateCoins(coinsToAward, `Watched 1 minute of ${video.title}`);
          setCoinsEarned(prevCoins => prevCoins + coinsToAward);
          
          // Show animation
          setShowCoinAnimation(true);
          setTimeout(() => setShowCoinAnimation(false), 2000);
          
          toast({
            title: "+3 Coins Earned!",
            description: "Keep watching to earn more!",
            duration: 2000,
          });
          
          return 60; // Reset to 60 seconds
        }
        return prev - 1;
      });
    }, 1000);

    toast({
      title: "Started Earning!",
      description: "You'll earn 3 coins every minute while watching",
      duration: 3000,
    });
  };

  const stopEarning = () => {
    console.log('Stopping coin earning');
    setIsEarning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (rewardTimerRef.current) clearInterval(rewardTimerRef.current);
  };

  const handleComplete = () => {
    stopEarning();
    onComplete(coinsEarned);
  };

  const handleCancel = () => {
    stopEarning();
    onCancel();
  };

  const handleExternalWatch = () => {
    if (!isEarning) {
      startEarning();
    }
    window.open(video.original_url, '_blank');
    
    toast({
      title: "Watching Externally",
      description: "Coins will be awarded as you watch. Come back to stop the timer when done!",
      duration: 5000,
    });
  };

  const calculateProgress = () => {
    return Math.min((timeWatched / video.duration) * 100, 100);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateTotalCoins = (duration: number) => {
    const minutes = Math.ceil(duration / 60);
    return minutes * 3;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {video.title}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {video.duration_display} • Up to {calculateTotalCoins(video.duration)} coins
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Video embed or placeholder */}
        <div className="w-full aspect-video rounded-md bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
          <div className="text-center space-y-4 p-6">
            <Play size={48} className="text-gray-400 mx-auto" />
            <div>
              <p className="text-gray-600 mb-2 font-medium">
                Ready to watch: {video.title}
              </p>
              <p className="text-sm text-gray-500">
                Start earning coins by clicking "Start Earning" below, then watch the video externally
              </p>
            </div>
          </div>
        </div>

        {/* Earning Status */}
        {isEarning ? (
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Watch progress</span>
              <span>{Math.floor(calculateProgress())}%</span>
            </div>
            <Progress value={calculateProgress()} className="h-3" />
            
            <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Coins size={16} className="text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  Coins earned: {coinsEarned}
                </span>
                {showCoinAnimation && (
                  <span className="text-green-600 font-bold animate-pulse">
                    +3!
                  </span>
                )}
              </div>
              <div className="text-sm text-yellow-600 flex items-center gap-1">
                <Clock size={14} />
                Next reward in: {nextRewardIn}s
              </div>
            </div>

            <div className="text-center text-sm text-gray-600">
              Time watched: {formatTime(timeWatched)} / {video.duration_display}
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <Button 
              onClick={startEarning}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              size="lg"
            >
              <Play size={16} />
              Start Earning Coins
            </Button>
            <p className="text-sm text-gray-500">
              Click to start the coin timer, then watch the video to earn 3 coins per minute
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            className="flex-1"
          >
            {isEarning ? 'Stop & Exit' : 'Cancel'}
          </Button>
          
          <Button 
            onClick={handleExternalWatch}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
          >
            <ExternalLink size={16} />
            {isEarning ? 'Continue Watching' : 'Watch Video'}
          </Button>
          
          {isEarning && calculateProgress() >= 100 && (
            <Button 
              onClick={handleComplete}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <CheckCircle size={16} />
              Complete ({coinsEarned} coins)
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleVideoWatcher;
