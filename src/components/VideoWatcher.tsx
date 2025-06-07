
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Coins, ExternalLink, CheckCircle } from 'lucide-react';
import VideoPlayer from './VideoPlayer';
import { useVideoWatcher } from '@/hooks/useVideoWatcher';

interface VideoWatcherProps {
  onCancel: () => void;
  onComplete: (coinsEarned: number) => void;
}

const VideoWatcher: React.FC<VideoWatcherProps> = ({ onCancel, onComplete }) => {
  const {
    activeVideo,
    watchProgress,
    videoReady,
    videoError,
    externalWatchStarted,
    coinsEarnedThisSession,
    nextRewardIn,
    showCoinAnimation,
    handleVideoReady,
    handleVideoError,
    handleExternalWatch,
    resetState
  } = useVideoWatcher();

  if (!activeVideo) return null;

  const calculateTotalCoins = (duration: number) => {
    const minutes = Math.ceil(duration / 60);
    return minutes * 3;
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

  const handleCancel = () => {
    resetState();
    onCancel();
  };

  const handleComplete = () => {
    onComplete(coinsEarnedThisSession);
    resetState();
  };

  const handleExternalWatchAsync = async () => {
    await handleExternalWatch();
  };

  return (
    <div className="mb-8">
      <VideoPlayer 
        type={activeVideo.platform_type}
        embedUrl={activeVideo.embed_url}
        originalUrl={activeVideo.original_url}
        title={activeVideo.title}
        onError={handleVideoError}
        onExternalWatch={handleExternalWatchAsync}
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
            onClick={handleComplete}
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
              onClick={handleCancel}
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
  );
};

export default VideoWatcher;
