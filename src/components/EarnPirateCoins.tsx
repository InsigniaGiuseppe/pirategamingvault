
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Twitch, Youtube, Clock, Coins, Play, CheckCircle, ExternalLink } from 'lucide-react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useToast } from '@/hooks/use-toast';
import { Progress } from "@/components/ui/progress";
import VideoPlayer from './VideoPlayer';
import { getWorkingVideoExamples } from '@/utils/videoProcessor';

interface VideoItem {
  id: string;
  type: 'twitch' | 'youtube';
  title: string;
  thumbnail: string;
  duration: string;
  durationDisplay: string;
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
    const savedVideos = localStorage.getItem('watchEarnVideos');
    if (savedVideos) {
      try {
        setVideos(JSON.parse(savedVideos));
      } catch (e) {
        console.error('Error parsing videos', e);
        initializeDefaultVideos();
      }
    } else {
      initializeDefaultVideos();
    }
    
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

  const initializeDefaultVideos = () => {
    const defaultVideos = getWorkingVideoExamples();
    setVideos(defaultVideos);
    localStorage.setItem('watchEarnVideos', JSON.stringify(defaultVideos));
  };

  const handleWatchVideo = (video: VideoItem) => {
    setActiveVideo(video);
    setWatchProgress(0);
    setIsWatching(true);
    setVideoError(false);
    
    if (progressInterval.current) {
      window.clearInterval(progressInterval.current);
    }
    
    const duration = parseInt(video.duration);
    const intervalStep = 2;
    
    // For Twitch videos, start progress immediately since they often can't embed
    if (video.type === 'twitch') {
      toast({
        title: "Twitch Stream Detected",
        description: "Twitch streams may not embed properly. If needed, you'll be redirected to watch on Twitch directly.",
        duration: 4000,
      });
    }
    
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
  };

  const handleVideoError = () => {
    setVideoError(true);
    if (progressInterval.current) {
      window.clearInterval(progressInterval.current);
    }
  };

  const handleWatchExternal = () => {
    if (!activeVideo) return;
    
    window.open(activeVideo.url, '_blank');
    
    // For external watching, complete the video after a short delay
    setTimeout(() => {
      completeVideo(activeVideo);
    }, 1500);
  };

  const completeVideo = (video: VideoItem) => {
    if (!watchedVideos.has(video.id)) {
      addPirateCoins(video.reward, `Watched ${video.title}`);
      
      const newWatched = new Set(watchedVideos);
      newWatched.add(video.id);
      setWatchedVideos(newWatched);
      
      if (user) {
        const watchedArray = Array.from(newWatched);
        localStorage.setItem(`${user.username}_watchedVideos`, JSON.stringify(watchedArray));
      }
      
      toast({
        title: "Coins Earned!",
        description: `You earned ${video.reward} Pirate Coins!`,
        duration: 3000,
      });
      
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
                  {activeVideo.type === 'twitch' 
                    ? "This Twitch stream cannot be embedded due to platform restrictions. You can watch it directly on Twitch." 
                    : "This YouTube video may be private, restricted, or doesn't allow embedding."}
                </p>
                <Button 
                  onClick={handleWatchExternal}
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
              originalUrl={activeVideo.url}
              title={activeVideo.title}
              onError={handleVideoError}
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
                {activeVideo.type === 'twitch' && (
                  <Button 
                    onClick={handleWatchExternal}
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
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/lovable-uploads/69fae18f-9c67-48fd-8006-c6181610037b.png';
                  }}
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
                {video.type === 'twitch' && (
                  <div className="absolute bottom-2 left-2 bg-purple-600/90 text-white px-2 py-1 text-xs rounded-md">
                    External Link
                  </div>
                )}
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
          ))}
        </div>
      )}
    </div>
  );
};

export default EarnPirateCoins;
