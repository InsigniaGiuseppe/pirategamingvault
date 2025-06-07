
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Twitch, Youtube, Clock, Coins, Play, CheckCircle, ExternalLink } from 'lucide-react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useToast } from '@/hooks/use-toast';
import { Progress } from "@/components/ui/progress";
import VideoPlayer from './VideoPlayer';
import { getVideos, trackVideoAnalytics, Video } from '@/services/videoService';

const EarnPirateCoins = () => {
  const [watchedVideos, setWatchedVideos] = useState<Set<string>>(new Set());
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [watchProgress, setWatchProgress] = useState<number>(0);
  const [isWatching, setIsWatching] = useState<boolean>(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [videoError, setVideoError] = useState<boolean>(false);
  const [externalWatchStarted, setExternalWatchStarted] = useState<boolean>(false);
  const { addPirateCoins, user } = useSimpleAuth();
  const { toast } = useToast();
  const progressInterval = useRef<number | null>(null);

  useEffect(() => {
    loadVideos();
    loadWatchedVideos();
  }, [user]);

  const loadVideos = async () => {
    try {
      const data = await getVideos(false); // Only active videos
      setVideos(data);
    } catch (error) {
      console.error('Failed to load videos:', error);
      toast({
        title: "Error",
        description: "Failed to load videos",
        variant: "destructive",
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
          console.error('Error parsing watched videos', e);
        }
      }
    }
  };

  const handleWatchVideo = async (video: Video) => {
    console.log('Starting to watch video:', video);
    
    setActiveVideo(video);
    setWatchProgress(0);
    setIsWatching(true);
    setVideoError(false);
    setExternalWatchStarted(false);
    
    // Track view analytics
    await trackVideoAnalytics(video.id, 'view', user?.id);
    
    if (progressInterval.current) {
      window.clearInterval(progressInterval.current);
    }
    
    const duration = video.duration;
    const intervalStep = 2;
    
    // For Twitch content, show helpful message
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
    
    progressInterval.current = window.setInterval(() => {
      setWatchProgress(prev => {
        const newProgress = prev + (intervalStep / duration * 100);
        
        if (newProgress >= 100) {
          if (progressInterval.current) window.clearInterval(progressInterval.current);
          completeVideo(video, duration);
          return 100;
        }
        
        return newProgress;
      });
    }, intervalStep * 1000) as unknown as number;
  };

  const handleVideoError = () => {
    console.log('Video error occurred for:', activeVideo);
    setVideoError(true);
    if (progressInterval.current) {
      window.clearInterval(progressInterval.current);
    }
  };

  const handleExternalWatch = async () => {
    if (!activeVideo) return;
    
    console.log('External watch started for:', activeVideo.platform_type, activeVideo.video_id);
    setExternalWatchStarted(true);
    
    if (activeVideo.platform_type === 'twitch-clip') {
      // For clips, complete immediately since they're short
      setTimeout(() => {
        completeVideo(activeVideo, activeVideo.duration);
      }, 2000);
      
      toast({
        title: "Watching Clip Externally",
        description: "Coins will be awarded in a few seconds!",
        duration: 3000,
      });
    } else {
      // For other content, use a reasonable delay
      setTimeout(() => {
        completeVideo(activeVideo, activeVideo.duration);
      }, 10000);
      
      toast({
        title: "Watching Externally",
        description: "Coins will be awarded shortly. Thank you for watching!",
        duration: 5000,
      });
    }
  };

  const completeVideo = async (video: Video, watchDuration: number) => {
    if (!watchedVideos.has(video.id)) {
      addPirateCoins(video.reward_amount, `Watched ${video.title}`);
      
      const newWatched = new Set(watchedVideos);
      newWatched.add(video.id);
      setWatchedVideos(newWatched);
      
      if (user) {
        const watchedArray = Array.from(newWatched);
        localStorage.setItem(`${user.username}_watchedVideos`, JSON.stringify(watchedArray));
      }
      
      // Track completion analytics
      await trackVideoAnalytics(video.id, 'complete', user?.id, watchDuration);
      
      toast({
        title: "Coins Earned!",
        description: `You earned ${video.reward_amount} Pirate Coins!`,
        duration: 3000,
      });
      
      setTimeout(() => {
        setActiveVideo(null);
        setIsWatching(false);
        setVideoError(false);
        setExternalWatchStarted(false);
      }, 1500);
    }
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

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-t-blue-600 border-r-transparent border-b-blue-600 border-l-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-600">Loading videos...</p>
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
          <p className="text-sm text-gray-600">Watch videos to earn coins • {videos.length} videos available</p>
        </div>
      </div>
      
      {isWatching && activeVideo ? (
        <div className="mb-8">
          <VideoPlayer 
            type={activeVideo.platform_type}
            embedUrl={activeVideo.embed_url}
            originalUrl={activeVideo.original_url}
            title={activeVideo.title}
            onError={handleVideoError}
            onExternalWatch={handleExternalWatch}
          />
          
          <div className="flex flex-col gap-4 mt-4">
            <div>
              <h3 className="text-lg font-medium mb-1">{activeVideo.title}</h3>
              <p className="text-sm text-gray-500">
                {getVideoTypeLabel(activeVideo.platform_type)} • 
                {activeVideo.duration_display} • 
                {activeVideo.reward_amount} coins reward
              </p>
            </div>
            
            {!externalWatchStarted && (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span>Watch progress</span>
                  <span>{Math.floor(watchProgress)}%</span>
                </div>
                <Progress value={watchProgress} className="h-2" />
              </div>
            )}
            
            {externalWatchStarted ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-green-800 font-medium">
                  External viewing in progress...
                </p>
                <p className="text-green-600 text-sm mt-1">
                  Your coins will be awarded automatically!
                </p>
              </div>
            ) : watchProgress < 100 ? (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    if (progressInterval.current) {
                      window.clearInterval(progressInterval.current);
                    }
                    setActiveVideo(null);
                    setIsWatching(false);
                    setWatchProgress(0);
                    setVideoError(false);
                  }}
                  className="border-gray-300 flex-1"
                >
                  Cancel Watching
                </Button>
                {(activeVideo.platform_type === 'twitch' || activeVideo.platform_type === 'twitch-clip') && (
                  <Button 
                    onClick={handleExternalWatch}
                    className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
                  >
                    <ExternalLink size={16} />
                    Watch on Twitch
                  </Button>
                )}
              </div>
            ) : (
              <Button 
                onClick={() => setActiveVideo(null)}
                className="bg-white text-black border-2 border-black hover:bg-black hover:text-white flex items-center gap-2"
              >
                <CheckCircle size={16} />
                Video Complete! ({activeVideo.reward_amount} coins earned)
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {videos.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              <p>No videos available at the moment.</p>
              <p className="text-sm mt-1">Check back later for new content!</p>
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
                      <span>{video.reward_amount} coins</span>
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
    </div>
  );
};

export default EarnPirateCoins;
