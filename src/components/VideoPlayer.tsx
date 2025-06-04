
import { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from './ui/button';

interface VideoPlayerProps {
  type: 'twitch' | 'youtube';
  embedUrl: string;
  originalUrl: string;
  title: string;
  onError?: () => void;
}

const VideoPlayer = ({ type, embedUrl, originalUrl, title, onError }: VideoPlayerProps) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setError(false);
    setIframeError(false);
  }, [embedUrl]);

  const handleLoad = () => {
    setLoaded(true);
  };

  const handleError = () => {
    console.error(`Error loading ${type} video: ${embedUrl}`);
    setError(true);
    setIframeError(true);
    if (onError) onError();
  };

  const handleIframeError = () => {
    console.error(`Iframe failed to load: ${embedUrl}`);
    setIframeError(true);
    if (onError) onError();
  };

  const getExternalUrl = () => {
    if (originalUrl) return originalUrl;
    
    // Fallback URL generation
    if (type === 'youtube') {
      const videoId = embedUrl.match(/embed\/([a-zA-Z0-9_-]{11})/)?.[1];
      return videoId ? `https://youtube.com/watch?v=${videoId}` : embedUrl;
    } else {
      const channel = embedUrl.match(/channel=([^&]+)/)?.[1];
      return channel ? `https://twitch.tv/${channel}` : embedUrl;
    }
  };

  if (error || iframeError) {
    return (
      <div className="bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center">
        <div className="text-center p-6">
          <h3 className="text-white font-medium mb-2">Video Unavailable</h3>
          <p className="text-gray-400 text-sm mb-4">
            {type === 'twitch' 
              ? "This Twitch stream may be offline, private, or doesn't allow embedding." 
              : "This YouTube video may be private, restricted, or doesn't allow embedding."}
          </p>
          <Button 
            onClick={() => window.open(getExternalUrl(), '_blank')}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <ExternalLink size={16} />
            Watch on {type === 'twitch' ? 'Twitch' : 'YouTube'}
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
            <p className="text-gray-400 text-sm">Loading video...</p>
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
        sandbox="allow-scripts allow-same-origin allow-presentation"
      />
    </div>
  );
};

export default VideoPlayer;
