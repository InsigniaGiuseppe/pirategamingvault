
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bomb, Play, AlertCircle, RefreshCw } from 'lucide-react';
import ErrorBoundary from './ErrorBoundary';
import SimpleVideoWatcher from './SimpleVideoWatcher';
import VideoGrid from './VideoGrid';
import MinesweeperGame from './MinesweeperGame';
import { useVideoManagement } from '@/hooks/useVideoManagement';

const EarnPirateCoins = () => {
  const { videos, loading, error, watchedVideos, loadVideos, markVideoWatched, trackAnalytics } = useVideoManagement();
  const [watchingVideo, setWatchingVideo] = useState(null);

  const handleWatchVideo = async (video) => {
    console.log('Starting to watch video:', video.title);
    setWatchingVideo(video);
    try {
      await trackAnalytics(video.id, 'view');
    } catch (error) {
      // Silent fail for analytics
    }
  };

  const handleWatchComplete = (coinsEarned) => {
    if (watchingVideo) {
      markVideoWatched(watchingVideo.id);
    }
    setWatchingVideo(null);
  };

  const handleCancelWatching = () => {
    setWatchingVideo(null);
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

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle size={20} />
              <span className="font-semibold">Error Loading Activities</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">{error}</p>
            <Button onClick={loadVideos} className="w-full">
              <RefreshCw size={16} className="mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="w-full max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold font-heading">Earn Pirate Coins</h2>
          <div className="flex items-center gap-1">
            <p className="text-sm text-gray-600">Multiple ways to earn coins • Play games or watch videos</p>
          </div>
        </div>
        
        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Play size={16} />
              Watch Videos (3 coins/min)
            </TabsTrigger>
            <TabsTrigger value="minesweeper" className="flex items-center gap-2">
              <Bomb size={16} />
              Minesweeper (Up to 30 coins)
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="videos" className="mt-6">
            {watchingVideo ? (
              <SimpleVideoWatcher 
                video={watchingVideo}
                onCancel={handleCancelWatching}
                onComplete={handleWatchComplete}
              />
            ) : (
              <VideoGrid 
                videos={videos}
                watchedVideos={watchedVideos}
                onWatchVideo={handleWatchVideo}
              />
            )}
          </TabsContent>
          
          <TabsContent value="minesweeper" className="mt-6">
            <ErrorBoundary>
              <MinesweeperGame />
            </ErrorBoundary>
          </TabsContent>
        </Tabs>
      </div>
    </ErrorBoundary>
  );
};

export default EarnPirateCoins;
