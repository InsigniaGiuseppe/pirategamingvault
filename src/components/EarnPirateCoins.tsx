import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Twitch, Youtube, Clock, Coins, Play, CheckCircle, ExternalLink } from 'lucide-react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useToast } from '@/hooks/use-toast';
import { Progress } from "@/components/ui/progress";
import VideoPlayer from './VideoPlayer';

interface VideoItem {
  id: string;
  type: 'twitch' | 'youtube';
  title: string;
  thumbnail: string;
  duration: string; // in seconds for actual implementation
  durationDisplay: string; // for display
  reward: number;
  url: string;
  embedUrl: string;
}

const EarnPirateCoins = () => {
  const [watchedVideos, setWatchedVideos] = useState<Set<string>>(new Set());
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [watchProgress, setWatchProgress] = useState<number>(0);
  const [isWatching, setIsWatching] = useState<boolean>(false);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [videoError, setVideoError] = useState<boolean>(false);
  const { addPirateCoins, user } = useSimpleAuth();
  const { toast } = useToast();
  const progressInterval = useRef<number | null>(null);

  useEffect(() => {
    // Load videos from localStorage
    const savedVideos = localStorage.getItem('watchEarnVideos');
    if (savedVideos) {
      try {
        setVideos(JSON.parse(savedVideos));
      } catch (e) {
        console.error('Error parsing videos', e);
        // Use default videos if there's an error
        setVideos([
          {
            id: '1',
            type: 'twitch',
            title: 'Epic Boss Battle in Elden Ring',
            thumbnail: '/lovable-uploads/69fae18f-9c67-48fd-8006-c6181610037b.png',
            duration: '225', // 3min 45sec
            durationDisplay: '3:45',
            reward: 15,
            url: 'https://twitch.tv/dannehsbum',
            embedUrl: 'https://player.twitch.tv/?channel=dannehsbum&parent=' + window.location.hostname
          },
          {
            id: '2',
            type: 'youtube',
            title: 'Ultimate Guide to Palworld',
            thumbnail: '/lovable-uploads/69fae18f-9c67-48fd-8006-c6181610037b.png',
            duration: '320', // 5min 20sec
            durationDisplay: '5:20',
            reward: 25,
            url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
            embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
          },
          {
            id: '3',
            type: 'twitch',
            title: 'First Look at New DLC',
            thumbnail: '/lovable-uploads/69fae18f-9c67-48fd-8006-c6181610037b.png',
            duration: '150', // 2min 30sec
            durationDisplay: '2:30',
            reward: 10,
            url: 'https://twitch.tv/dannehsbum',
            embedUrl: 'https://player.twitch.tv/?channel=dannehsbum&parent=' + window.location.hostname
          },
          {
            id: '4',
            type: 'youtube',
            title: 'Secret Easter Eggs in Starfield',
            thumbnail: '/lovable-uploads/69fae18f-9c67-48fd-8006-c6181610037b.png',
            duration: '255', // 4min 15sec
            durationDisplay: '4:15',
            reward: 20,
            url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
            embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
          }
        ]);
      }
    }
    
    // Load watched videos from localStorage for the current user
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
  }, [user]);

  // Handle starting to watch video
  const handleWatchVideo = (video: VideoItem) => {
    setActiveVideo(video);
    setWatchProgress(0);
    setIsWatching(true);
    setVideoError(false);
    
    // Start progress tracking
    if (progressInterval.current) {
      window.clearInterval(progressInterval.current);
    }
    
    const duration = parseInt(video.duration);
    const intervalStep = 2; // Update every 2 seconds
    
    progressInterval.current = window.setInterval(() => {
      setWatchProgress(prev => {
        const newProgress = prev + (intervalStep / duration * 100);
        
        // If video is complete
        if (newProgress >= 100) {
          if (progressInterval.current) window.clearInterval(progressInterval.current);
          completeVideo(video);
          return 100;
        }
        
        return newProgress;
      });
    }, intervalStep * 1000) as unknown as number;
  };

  // Handle video loading error
  const handleVideoError = () => {
    setVideoError(true);
    if (progressInterval.current) {
      window.clearInterval(progressInterval.current);
    }
  };

  // Handle canceling video watch
  const handleCancelWatch = () => {
    if (progressInterval.current) {
      window.clearInterval(progressInterval.current);
    }
    setActiveVideo(null);
    setIsWatching(false);
    setWatchProgress(0);
    setVideoError(false);
  };

  // Handle opening video in external site
  const handleWatchExternal = () => {
    if (!activeVideo) return;
    
    window.open(activeVideo.url, '_blank');
    
    // We'll still award coins
    setTimeout(() => {
      completeVideo(activeVideo);
    }, 1500);
  };

  // Mark video as complete and award coins
  const completeVideo = (video: VideoItem) => {
    if (!watchedVideos.has(video.id)) {
      // Add pirate coins
      addPirateCoins(video.reward, `Watched ${video.title}`);
      
      // Update watched videos list in local state
      const newWatched = new Set(watchedVideos);
      newWatched.add(video.id);
      setWatchedVideos(newWatched);
      
      // Save watched videos to localStorage
      if (user) {
        const watchedArray = Array.from(newWatched);
        localStorage.setItem(`${user.username}_watchedVideos`, JSON.stringify(watchedArray));
      }
      
      // Show success message
      toast({
        title: "Coins Earned!",
        description: `You earned ${video.reward} Pirate Coins!`,
        duration: 3000,
      });
      
      // Reset state
      setTimeout(() => {
        setActiveVideo(null);
        setIsWatching(false);
        setVideoError(false);
      }, 1500);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold font-heading">Earn Pirate Coins</h2>
        <div className="flex items-center gap-1">
          <p className="text-sm text-gray-600">Watch videos to earn coins</p>
        </div>
      </div>
      
      {isWatching && activeVideo ? (
        <div className="mb-8">
          {videoError ? (
            <div className="bg-gray-900 rounded-lg overflow-hidden aspect-video mb-4 flex flex-col items-center justify-center p-8 text-center">
              <div className="mb-4 text-white">
                <h3 className="text-xl font-bold mb-2">Video cannot be embedded</h3>
                <p className="text-gray-400 mb-4">
                  Due to content provider restrictions, this video cannot be embedded in our site.
                </p>
                <Button 
                  onClick={() => {
                    if (!activeVideo) return;
                    window.open(activeVideo.url, '_blank');
                    setTimeout(() => {
                      completeVideo(activeVideo);
                    }, 1500);
                  }} 
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                >
                  <ExternalLink size={16} />
                  Watch on {activeVideo.type === 'twitch' ? 'Twitch' : 'YouTube'}
                </Button>
              </div>
            </div>
          ) : (
            <VideoPlayer 
              type={activeVideo.type}
              embedUrl={activeVideo.embedUrl}
              title={activeVideo.title}
              onError={() => setVideoError(true)}
            />
          )}
          
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-lg font-medium mb-1">{activeVideo.title}</h3>
              <p className="text-sm text-gray-500">
                {activeVideo.type === 'twitch' ? 'Twitch Stream' : 'YouTube Video'} • 
                {activeVideo.durationDisplay} • 
                {activeVideo.reward} coins reward
              </p>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span>Watch progress</span>
                <span>{Math.floor(watchProgress)}%</span>
              </div>
              <Progress value={watchProgress} className="h-2" />
            </div>
            
            {watchProgress < 100 ? (
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
                className="border-gray-300"
              >
                Cancel Watching
              </Button>
            ) : (
              <Button 
                onClick={() => setActiveVideo(null)}
                className="bg-white text-black border-2 border-black hover:bg-black hover:text-white flex items-center gap-2"
              >
                <CheckCircle size={16} />
                Video Complete! ({activeVideo.reward} coins earned)
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {videos.map((video) => (
            <Card key={video.id} className="overflow-hidden bg-white shadow-saas">
              <div className="relative">
                <img 
                  src={video.thumbnail} 
                  alt={video.title}
                  className="w-full h-[160px] object-cover"
                />
                <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 text-xs rounded-md flex items-center gap-1">
                  <Clock size={12} />
                  {video.durationDisplay}
                </div>
                <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 text-xs rounded-md flex items-center gap-1">
                  {video.type === 'twitch' ? (
                    <><Twitch size={12} className="text-purple-400" /> Twitch</>
                  ) : (
                    <><Youtube size={12} className="text-red-500" /> YouTube</>
                  )}
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium text-lg mb-2 line-clamp-2">{video.title}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <Coins size={14} className="text-yellow-500" />
                    <span>{video.reward} coins</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button
                  onClick={() => {
                    setActiveVideo(video);
                    setWatchProgress(0);
                    setIsWatching(true);
                    setVideoError(false);
                    
                    if (progressInterval.current) {
                      window.clearInterval(progressInterval.current);
                    }
                    
                    const duration = parseInt(video.duration);
                    const intervalStep = 2;
                    
                    progressInterval.current = window.setInterval(() => {
                      setWatchProgress(prev => {
                        const newProgress = prev + (intervalStep / duration * 100);
                        
                        if (newProgress >= 100) {
                          if (progressInterval.current) window.clearInterval(progressInterval.current);
                          completeVideo(video);
                          return 100;
                        }
                        
                        return newProgress;
                      });
                    }, intervalStep * 1000) as unknown as number;
                  }}
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
          ))}
        </div>
      )}
    </div>
  );
};

export default EarnPirateCoins;
