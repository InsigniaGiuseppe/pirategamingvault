
import { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from './ui/button';

interface VideoPlayerProps {
  type: 'twitch' | 'youtube' | 'twitch-clip';
  embedUrl: string;
  originalUrl: string;
  title: string;
  onError?: () => void;
  onExternalWatch?: () => void;
}

const VideoPlayer = ({ type, embedUrl, originalUrl, title, onError, onExternalWatch }: VideoPlayerProps) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setError(false);
    setShowFallback(false);
    
    // For Twitch content, show fallback more quickly due to embedding restrictions
    if (type === 'twitch' || type === 'twitch-clip') {
      const timer = setTimeout(() => {
        if (!loaded) {
          setShowFallback(true);
        }
      }, 2000); // Reduced timeout for faster fallback
      
      return () => clearTimeout(timer);
    }
  }, [embedUrl, type, loaded]);

  const handleLoad = () => {
    setLoaded(true);
    setShowFallback(false);
  };

  const handleError = () => {
    console.error(`Error loading ${type} video: ${embedUrl}`);
    setError(true);
    if (onError) onError();
  };

  const handleIframeError = () => {
    console.error(`Iframe failed to load: ${embedUrl}`);
    setError(true);
    if (onError) onError();
  };

  const getExternalUrl = () => {
    if (originalUrl) return originalUrl;
    
    // Fallback URL generation
    if (type === 'youtube') {
      const videoId = embedUrl.match(/embed\/([a-zA-Z0-9_-]{11})/)?.[1];
      return videoId ? `https://youtube.com/watch?v=${videoId}` : embedUrl;
    } else if (type === 'twitch-clip') {
      const clipId = embedUrl.match(/clip=([^&]+)/)?.[1];
      return clipId ? `https://clips.twitch.tv/${clipId}` : embedUrl;
    } else {
      const channel = embedUrl.match(/channel=([^&]+)/)?.[1];
      return channel ? `https://twitch.tv/${channel}` : embedUrl;
    }
  };

  const handleWatchExternal = () => {
    window.open(getExternalUrl(), '_blank');
    if (onExternalWatch) {
      onExternalWatch();
    }
  };

  const getPlatformName = () => {
    switch (type) {
      case 'twitch-clip':
        return 'Twitch';
      case 'twitch':
        return 'Twitch';
      case 'youtube':
        return 'YouTube';
      default:
        return 'Platform';
    }
  };

  const getContentType = () => {
    switch (type) {
      case 'twitch-clip':
        return 'clip';
      case 'twitch':
        return 'stream';
      case 'youtube':
        return 'video';
      default:
        return 'content';
    }
  };

  // Show fallback for errors or Twitch timeout
  if (error || ((type === 'twitch' || type === 'twitch-clip') && showFallback && !loaded)) {
    return (
      <div className="bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center">
        <div className="text-center p-6">
          <h3 className="text-white font-medium mb-2">
            {type === 'twitch-clip' ? 'Clip Unavailable for Embedding' : 
             type === 'twitch' ? 'Stream Unavailable for Embedding' : 
             'Video Unavailable'}
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            {type === 'twitch-clip' 
              ? "This Twitch clip cannot be embedded due to platform restrictions. Watch it directly on Twitch to earn your coins!" 
              : type === 'twitch'
              ? "This Twitch stream may be offline, private, or doesn't allow embedding due to platform restrictions." 
              : "This YouTube video may be private, restricted, or doesn't allow embedding."}
          </p>
          <Button 
            onClick={handleWatchExternal}
            className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
          >
            <ExternalLink size={16} />
            Watch on {getPlatformName()}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black rounded-lg overflow-hidden aspect-video relative">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-t-blue-600 border-r-transparent border-b-blue-600 border-l-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-400 text-sm">
              Loading {getContentType()}...
            </p>
            {(type === 'twitch' || type === 'twitch-clip') && (
              <p className="text-gray-500 text-xs mt-1">
                If this takes too long, try watching on Twitch
              </p>
            )}
          </div>
        </div>
      )}
      <iframe 
        src={embedUrl}
        className="w-full h-full"
        allowFullScreen
        title={title}
        onLoad={handleLoad}
        onError={handleIframeError}
        allow="autoplay; encrypted-media; picture-in-picture"
        sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
        referrerPolicy="no-referrer-when-downgrade"
      />
      
      {/* Quick external link button for Twitch content */}
      {(type === 'twitch' || type === 'twitch-clip') && (
        <div className="absolute top-2 right-2">
          <Button 
            onClick={handleWatchExternal}
            size="sm"
            className="bg-purple-600/90 hover:bg-purple-700 text-white flex items-center gap-1 text-xs"
          >
            <ExternalLink size={12} />
            {type === 'twitch-clip' ? 'Clip' : 'Stream'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
