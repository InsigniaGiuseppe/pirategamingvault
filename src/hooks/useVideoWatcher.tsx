
import { useState, useEffect, useRef, useCallback } from 'react';
import { Video } from '@/services/videoService';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useToast } from '@/hooks/use-toast';

export const useVideoWatcher = () => {
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [watchProgress, setWatchProgress] = useState<number>(0);
  const [isWatching, setIsWatching] = useState<boolean>(false);
  const [videoReady, setVideoReady] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<boolean>(false);
  const [externalWatchStarted, setExternalWatchStarted] = useState<boolean>(false);
  const [coinsEarnedThisSession, setCoinsEarnedThisSession] = useState<number>(0);
  const [nextRewardIn, setNextRewardIn] = useState<number>(60);
  const [showCoinAnimation, setShowCoinAnimation] = useState<boolean>(false);
  
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const coinAnimationTimeout = useRef<NodeJS.Timeout | null>(null);
  const { addPirateCoins } = useSimpleAuth();
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      if (coinAnimationTimeout.current) {
        clearTimeout(coinAnimationTimeout.current);
      }
    };
  }, []);

  const startWatching = useCallback((video: Video) => {
    console.log('Starting to watch video:', video.title);
    setActiveVideo(video);
    setWatchProgress(0);
    setIsWatching(true);
    setVideoError(false);
    setExternalWatchStarted(false);
    setVideoReady(false);
    setCoinsEarnedThisSession(0);
    setNextRewardIn(60);
    setShowCoinAnimation(false);
    
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    
    if (video.platform_type === 'twitch' || video.platform_type === 'twitch-clip') {
      const message = video.platform_type === 'twitch-clip' 
        ? "If the clip doesn't embed, you can watch it directly on Twitch to earn coins!"
        : "If the stream doesn't embed, you can watch it directly on Twitch to earn coins!";
        
      toast({
        title: video.platform_type === 'twitch-clip' ? "Twitch Clip Detected" : "Twitch Stream Detected",
        description: message,
        duration: 4000,
      });
    }
  }, [toast]);

  const awardProgressiveCoins = useCallback(() => {
    if (!activeVideo) return;
    
    const coinsToAward = 3;
    addPirateCoins(coinsToAward, `Watched 1 minute of ${activeVideo.title}`);
    
    setCoinsEarnedThisSession(prev => prev + coinsToAward);
    setShowCoinAnimation(true);
    
    toast({
      title: "+3 Coins Earned!",
      description: "Keep watching to earn more!",
      duration: 2000,
    });
    
    if (coinAnimationTimeout.current) {
      clearTimeout(coinAnimationTimeout.current);
    }
    
    coinAnimationTimeout.current = setTimeout(() => {
      setShowCoinAnimation(false);
    }, 2000);
  }, [activeVideo, addPirateCoins, toast]);

  const startProgressiveTimer = useCallback(() => {
    if (!activeVideo) return;
    
    console.log('Starting progressive timer for video watching');
    const duration = activeVideo.duration;
    const intervalStep = 1; // 1 second intervals
    
    progressInterval.current = setInterval(() => {
      setWatchProgress(prev => {
        const newProgress = prev + (intervalStep / duration * 100);
        const finalProgress = Math.min(newProgress, 100);
        
        if (finalProgress >= 100 && progressInterval.current) {
          clearInterval(progressInterval.current);
          console.log('Video watching completed');
        }
        
        return finalProgress;
      });
      
      setNextRewardIn(prev => {
        const newTime = prev - intervalStep;
        
        if (newTime <= 0) {
          awardProgressiveCoins();
          return 60; // Reset to 60 seconds
        }
        
        return newTime;
      });
    }, intervalStep * 1000);
  }, [activeVideo, awardProgressiveCoins]);

  const handleVideoReady = useCallback(() => {
    console.log('Video ready, starting progressive timer');
    setVideoReady(true);
    startProgressiveTimer();
  }, [startProgressiveTimer]);

  const handleVideoError = useCallback(() => {
    console.log('Video error occurred');
    setVideoError(true);
    setVideoReady(false);
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
  }, []);

  const handleExternalWatch = useCallback(() => {
    if (!activeVideo) return;
    
    console.log('Starting external watch mode');
    setExternalWatchStarted(true);
    setVideoReady(true);
    
    if (activeVideo.platform_type === 'twitch-clip') {
      // For clips, award coins immediately since they're short
      setTimeout(() => {
        awardProgressiveCoins();
      }, 2000);
      
      toast({
        title: "Watching Externally",
        description: "Coins will be awarded in a few seconds!",
        duration: 3000,
      });
    } else {
      // For longer content, start progressive rewards
      startProgressiveTimer();
      
      toast({
        title: "Watching Externally",
        description: "Progressive coins will be awarded as you watch!",
        duration: 5000,
      });
    }
  }, [activeVideo, startProgressiveTimer, toast, awardProgressiveCoins]);

  const resetState = useCallback(() => {
    console.log('Resetting video watcher state');
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    if (coinAnimationTimeout.current) {
      clearTimeout(coinAnimationTimeout.current);
    }
    
    setActiveVideo(null);
    setIsWatching(false);
    setVideoError(false);
    setExternalWatchStarted(false);
    setVideoReady(false);
    setCoinsEarnedThisSession(0);
    setWatchProgress(0);
    setNextRewardIn(60);
    setShowCoinAnimation(false);
  }, []);

  return {
    // State
    activeVideo,
    watchProgress,
    isWatching,
    videoReady,
    videoError,
    externalWatchStarted,
    coinsEarnedThisSession,
    nextRewardIn,
    showCoinAnimation,
    
    // Actions
    startWatching,
    handleVideoReady,
    handleVideoError,
    handleExternalWatch,
    resetState
  };
};
