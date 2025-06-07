import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Twitch, Youtube, Clock, Coins, Play, CheckCircle, ExternalLink, Bomb } from 'lucide-react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useToast } from '@/hooks/use-toast';
import { Progress } from "@/components/ui/progress";
import VideoPlayer from './VideoPlayer';
import Minesweeper from './Minesweeper';
import { getVideos, trackVideoAnalytics, Video } from '@/services/videoService';

const EarnPirateCoins = () => {
  const [watchedVideos, setWatchedVideos] = useState<Set<string>>(new Set());
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [watchProgress, setWatchProgress] = useState<number>(0);
  const [isWatching, setIsWatching] = useState<boolean>(false);
  const [videoReady, setVideoReady] = useState<boolean>(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [videoError, setVideoError] = useState<boolean>(false);
  const [externalWatchStarted, setExternalWatchStarted] = useState<boolean>(false);
  const [coinsEarnedThisSession, setCoinsEarnedThisSession] = useState<number>(0);
  const [nextRewardIn, setNextRewardIn] = useState<number>(60);
  const [showCoinAnimation, setShowCoinAnimation] = useState<boolean>(false);
  const { addPirateCoins, user } = useSimpleAuth();
  const { toast } = useToast();
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const coinAnimationTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadVideos();
    loadWatchedVideos();
  }, [user]);

  // Cleanup intervals on unmount
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

  const loadVideos = async () => {
    try {
      const data = await getVideos(false);
      setVideos(data);
    } catch (error) {
      setVideos([]); // Fallback to empty array
      toast({
        title: "Notice",
        description: "Videos are temporarily unavailable",
        variant: "default",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadWatchedVideos = () => {
    if (user) {
      const watchedVideosStr = localStorage.getItem(`${user.username}_watchedVideos`);
      if (watchedVideosStr) {
        try {
          const watchedIds = JSON.parse(watchedVideosStr);
          setWatchedVideos(new Set(watchedIds));
        } catch (e) {
          // Silent fail and reset to empty set
          setWatchedVideos(new Set());
        }
      }
    }
  };

  const handleWatchVideo = async (video: Video) => {
    setActiveVideo(video);
    setWatchProgress(0);
    setIsWatching(true);
    setVideoError(false);
    setExternalWatchStarted(false);
    setVideoReady(false);
    setCoinsEarnedThisSession(0);
    setNextRewardIn(60);
    setShowCoinAnimation(false);
    
    try {
      await trackVideoAnalytics(video.id, 'view', user?.id);
    } catch (error) {
      // Silent fail for analytics
    }
    
    // Clear any existing intervals
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
  };

  const handleVideoReady = () => {
    setVideoReady(true);
    startProgressiveWatchTimer();
  };

  const startProgressiveWatchTimer = () => {
    if (!activeVideo) return;
    
    const duration = activeVideo.duration;
    const intervalStep = 1;
    
    progressInterval.current = setInterval(() => {
      setWatchProgress(prev => {
        const newProgress = prev + (intervalStep / duration * 100);
        return Math.min(newProgress, 100);
      });
      
      setNextRewardIn(prev => {
        const newTime = prev - intervalStep;
        
        if (newTime <= 0) {
          awardProgressiveCoins();
          return 60;
        }
        
        return newTime;
      });
      
      setWatchProgress(currentProgress => {
        if (currentProgress >= 100) {
          if (progressInterval.current) {
            clearInterval(progressInterval.current);
          }
          completeVideo(activeVideo, duration);
        }
        return currentProgress;
      });
    }, intervalStep * 1000);
  };

  const awardProgressiveCoins = () => {
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
    
    // Clear existing timeout before setting new one
    if (coinAnimationTimeout.current) {
      clearTimeout(coinAnimationTimeout.current);
    }
    
    coinAnimationTimeout.current = setTimeout(() => {
      setShowCoinAnimation(false);
    }, 2000);
  };

  const handleVideoError = () => {
    setVideoError(true);
    setVideoReady(false);
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
  };

  const handleExternalWatch = async () => {
    if (!activeVideo) return;
    
    setExternalWatchStarted(true);
    setVideoReady(true);
    
    if (activeVideo.platform_type === 'twitch-clip') {
      setTimeout(() => {
        completeVideo(activeVideo, activeVideo.duration);
      }, 2000);
      
      toast({
        title: "Watching Externally",
        description: "Coins will be awarded in a few seconds!",
        duration: 3000,
      });
    } else {
      startProgressiveWatchTimer();
      
      toast({
        title: "Watching Externally",
        description: "Progressive coins will be awarded as you watch!",
        duration: 5000,
      });
    }
  };

  const completeVideo = async (video: Video, watchDuration: number) => {
    if (!watchedVideos.has(video.id)) {
      const remainingMinutes = Math.floor((100 - watchProgress) / 100 * video.duration / 60);
      if (remainingMinutes > 0) {
        const finalCoins = remainingMinutes * 3;
        addPirateCoins(finalCoins, `Completed ${video.title}`);
        setCoinsEarnedThisSession(prev => prev + finalCoins);
      }
      
      const newWatched = new Set(watchedVideos);
      newWatched.add(video.id);
      setWatchedVideos(newWatched);
      
      if (user) {
        const watchedArray = Array.from(newWatched);
        localStorage.setItem(`${user.username}_watchedVideos`, JSON.stringify(watchedArray));
      }
      
      try {
        await trackVideoAnalytics(video.id, 'complete', user?.id, watchDuration);
      } catch (error) {
        // Silent fail for analytics
      }
      
      const totalEarned = coinsEarnedThisSession + (remainingMinutes > 0 ? remainingMinutes * 3 : 0);
      toast({
        title: "Video Completed!",
        description: `You earned ${totalEarned} coins total!`,
        duration: 3000,
      });
      
      setTimeout(() => {
        resetVideoState();
      }, 2000);
    }
  };

  const resetVideoState = () => {
    // Clear all intervals and timeouts
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
  };

  const handleCancelWatching = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    if (coinAnimationTimeout.current) {
      clearTimeout(coinAnimationTimeout.current);
    }
    resetVideoState();
  };

  const getVideoIcon = (type: string) => {
    switch (type) {
      case 'twitch-clip':
        return <Twitch size={12} className="text-purple-400" />;
      case 'twitch':
        return <Twitch size={12} className="text-purple-400" />;
      case 'youtube':
        return <Youtube size={12} className="text-red-500" />;
      default:
        return null;
    }
  };

  const getVideoTypeLabel = (type: string) => {
    switch (type) {
      case 'twitch-clip':
        return 'Clip';
      case 'twitch':
        return 'Stream';
      case 'youtube':
        return 'YouTube';
      default:
        return 'Video';
    }
  };

  const calculateTotalCoins = (duration: number) => {
    const minutes = Math.ceil(duration / 60);
    return minutes * 3;
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-t-blue-600 border-r-transparent border-b-blue-600 border-l-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-600">Loading activities...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold font-heading">Earn Pirate Coins</h2>
        <div className="flex items-center gap-1">
          <p className="text-sm text-gray-600">Multiple ways to earn coins • Play games or watch videos</p>
        </div>
      </div>
      
      <Tabs defaultValue="minesweeper" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="minesweeper" className="flex items-center gap-2">
            <Bomb size={16} />
            Minesweeper (Up to 30 coins)
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <Play size={16} />
            Watch Videos (3 coins/min)
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="minesweeper" className="mt-6">
          <Minesweeper />
        </TabsContent>
        
        <TabsContent value="videos" className="mt-6">
          {isWatching && activeVideo ? (
            <div className="mb-8">
              <VideoPlayer 
                type={activeVideo.platform_type}
                embedUrl={activeVideo.embed_url}
                originalUrl={activeVideo.original_url}
                title={activeVideo.title}
                onError={handleVideoError}
                onExternalWatch={handleExternalWatch}
                onVideoReady={handleVideoReady}
              />
              
              <div className="flex flex-col gap-4 mt-4">
                <div>
                  <h3 className="text-lg font-medium mb-1">{activeVideo.title}</h3>
                  <p className="text-sm text-gray-500">
                    {getVideoTypeLabel(activeVideo.platform_type)} • 
                    {activeVideo.duration_display} • 
                    Up to {calculateTotalCoins(activeVideo.duration)} coins
                  </p>
                </div>
                
                {videoError ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <p className="text-red-800 font-medium mb-2">
                      Video failed to load
                    </p>
                    <p className="text-red-600 text-sm mb-3">
                      This content cannot be embedded. Watch it externally to earn coins!
                    </p>
                    <Button 
                      onClick={handleExternalWatch}
                      className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
                    >
                      <ExternalLink size={16} />
                      Watch Externally
                    </Button>
                  </div>
                ) : !videoReady && !externalWatchStarted ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <p className="text-blue-800 font-medium">
                      Waiting for video to load...
                    </p>
                    <p className="text-blue-600 text-sm mt-1">
                      Progressive rewards will start once the video is ready
                    </p>
                  </div>
                ) : externalWatchStarted ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <p className="text-green-800 font-medium">
                      External viewing in progress...
                    </p>
                    <p className="text-green-600 text-sm mt-1">
                      Earning 3 coins per minute watched!
                    </p>
                  </div>
                ) : watchProgress < 100 ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between text-sm">
                      <span>Watch progress</span>
                      <span>{Math.floor(watchProgress)}%</span>
                    </div>
                    <Progress value={watchProgress} className="h-3" />
                    
                    <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Coins size={16} className="text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">
                          Coins earned this session: {coinsEarnedThisSession}
                        </span>
                        {showCoinAnimation && (
                          <span className="text-green-600 font-bold animate-pulse">
                            +3!
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-yellow-600">
                        Next reward in: {nextRewardIn}s
                      </div>
                    </div>
                  </div>
                ) : (
                  <Button 
                    onClick={resetVideoState}
                    className="bg-white text-black border-2 border-black hover:bg-black hover:text-white flex items-center gap-2"
                  >
                    <CheckCircle size={16} />
                    Video Complete! ({coinsEarnedThisSession} coins earned)
                  </Button>
                )}
                
                {!externalWatchStarted && watchProgress < 100 && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={handleCancelWatching}
                      className="border-gray-300 flex-1"
                    >
                      Cancel Watching
                    </Button>
                    {(activeVideo.platform_type === 'twitch' || 
                      activeVideo.platform_type === 'twitch-clip') && (
                      <Button 
                        onClick={handleExternalWatch}
                        className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
                      >
                        <ExternalLink size={16} />
                        Watch Externally
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {videos.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500">
                  <p>No videos available at the moment.</p>
                  <p className="text-sm mt-1">Videos will be added soon!</p>
                </div>
              ) : (
                videos.map((video) => (
                  <Card key={video.id} className="overflow-hidden bg-white shadow-saas">
                    <div className="relative">
                      <img 
                        src={video.thumbnail_url} 
                        alt={video.title}
                        className="w-full h-[160px] object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/lovable-uploads/69fae18f-9c67-48fd-8006-c6181610037b.png';
                        }}
                      />
                      <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 text-xs rounded-md flex items-center gap-1">
                        <Clock size={12} />
                        {video.duration_display}
                      </div>
                      <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 text-xs rounded-md flex items-center gap-1">
                        {getVideoIcon(video.platform_type)}
                        {getVideoTypeLabel(video.platform_type)}
                      </div>
                      {(video.platform_type === 'twitch' || video.platform_type === 'twitch-clip') && (
                        <div className="absolute bottom-2 left-2 bg-purple-600/90 text-white px-2 py-1 text-xs rounded-md">
                          May Open Externally
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium text-lg mb-2 line-clamp-2">{video.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Coins size={14} className="text-yellow-500" />
                          <span>Up to {calculateTotalCoins(video.duration)} coins (3/min)</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button
                        onClick={() => handleWatchVideo(video)}
                        disabled={watchedVideos.has(video.id)}
                        className={`w-full flex items-center justify-center gap-2 ${
                          watchedVideos.has(video.id)
                            ? "bg-gray-100 text-gray-400 border-gray-200"
                            : "bg-white text-black border-2 border-black hover:bg-black hover:text-white"
                        }`}
                      >
                        {watchedVideos.has(video.id) ? (
                          <>
                            <CheckCircle size={16} />
                            Already Watched
                          </>
                        ) : (
                          <>
                            <Play size={16} />
                            Watch & Earn
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EarnPirateCoins;
