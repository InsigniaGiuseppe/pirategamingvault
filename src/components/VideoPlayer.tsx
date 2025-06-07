
import { useState, useEffect, useRef } from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from './ui/button';

interface VideoPlayerProps {
  type: 'twitch' | 'youtube' | 'twitch-clip';
  embedUrl: string;
  originalUrl: string;
  title: string;
  onError?: () => void;
  onExternalWatch?: () => void;
  onVideoReady?: () => void;
}

const VideoPlayer = ({ 
  type, 
  embedUrl, 
  originalUrl, 
  title, 
  onError, 
  onExternalWatch, 
  onVideoReady 
}: VideoPlayerProps) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const readyNotifiedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log('VideoPlayer rendering with:', { type, embedUrl, originalUrl });
    setLoaded(false);
    setError(false);
    setShowFallback(false);
    readyNotifiedRef.current = false;
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // For Twitch content, show fallback more quickly due to embedding restrictions
    if (type === 'twitch' || type === 'twitch-clip') {
      timeoutRef.current = setTimeout(() => {
        if (!loaded) {
          console.log('Twitch content failed to load, showing fallback');
          setShowFallback(true);
        }
      }, 2000);
    }
    
    // For YouTube videos, give more time since normal videos should embed properly
    if (type === 'youtube') {
      timeoutRef.current = setTimeout(() => {
        if (!loaded && !error) {
          console.log('YouTube video failed to load, showing fallback');
          setShowFallback(true);
          setError(true);
          if (onError) onError();
        }
      }, 5000);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [embedUrl, type, loaded, error, onError]);

  const handleLoad = () => {
    console.log('Video content loaded successfully');
    setLoaded(true);
    setShowFallback(false);
    
    // Clear timeout when video loads successfully
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Notify parent that video is ready to watch
    if (!readyNotifiedRef.current && onVideoReady) {
      readyNotifiedRef.current = true;
      onVideoReady();
    }
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
    console.log('Opening external video:', getExternalUrl());
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

  const getErrorTitle = () => {
    switch (type) {
      case 'twitch-clip':
        return 'Clip Unavailable for Embedding';
      case 'twitch':
        return 'Stream Unavailable for Embedding';
      case 'youtube':
        return 'Video Unavailable for Embedding';
      default:
        return 'Content Unavailable';
    }
  };

  const getErrorMessage = () => {
    switch (type) {
      case 'twitch-clip':
        return "This Twitch clip cannot be embedded due to platform restrictions. Watch it directly on Twitch to earn coins!";
      case 'twitch':
        return "This Twitch stream may be offline, private, or doesn't allow embedding due to platform restrictions.";
      case 'youtube':
        return "This YouTube video may be private, restricted, or doesn't allow embedding. Normal YouTube videos should work better than Shorts.";
      default:
        return "This content cannot be embedded. Please watch it on the original platform.";
    }
  };

  // Show fallback for errors or timeout
  if (error || ((type === 'twitch' || type === 'twitch-clip') && showFallback && !loaded) || 
      (type === 'youtube' && showFallback)) {
    return (
      <div className="bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center">
        <div className="text-center p-6">
          <h3 className="text-white font-medium mb-2">
            {getErrorTitle()}
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            {getErrorMessage()}
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
                If this takes too long, try watching externally
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
      
      {/* Quick external link button for problematic content */}
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
