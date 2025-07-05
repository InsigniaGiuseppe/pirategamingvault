
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Play, Star, Coins, CheckCircle, Youtube, Twitch } from 'lucide-react';
import { formatDuration } from '@/utils/duration';
import { Video } from '@/services/videoService';

interface VideoGridProps {
  videos: Video[];
  watchedVideos: Set<string>;
  onWatchVideo: (video: Video) => void;
}

const VideoGrid: React.FC<VideoGridProps> = ({ videos, watchedVideos, onWatchVideo }) => {
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

  if (videos.length === 0) {
    return (
      <div className="col-span-full text-center py-8 text-gray-500">
        <p>No videos available at the moment.</p>
        <p className="text-sm mt-1">Videos will be added soon!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6">
      {videos.map((video) => (
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
              {formatDuration(video.duration)}
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
              onClick={() => onWatchVideo(video)}
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
  );
};

export default VideoGrid;
