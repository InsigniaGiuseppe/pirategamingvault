
import { useState, useEffect } from 'react';

interface VideoPlayerProps {
  type: 'twitch' | 'youtube';
  embedUrl: string;
  title: string;
  onError?: () => void;
}

const VideoPlayer = ({ type, embedUrl, title, onError }: VideoPlayerProps) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Reset states when embedUrl changes
    setLoaded(false);
    setError(false);
  }, [embedUrl]);

  const handleLoad = () => {
    setLoaded(true);
  };

  const handleError = () => {
    console.error(`Error loading ${type} video`);
    setError(true);
    if (onError) onError();
  };

  // Add current domain to Twitch embed URLs
  const processedUrl = type === 'twitch' && !embedUrl.includes('parent=') 
    ? `${embedUrl}&parent=${window.location.hostname}`
    : embedUrl;

  if (error) {
    return (
      <div className="bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center">
        <div className="text-center p-6">
          <h3 className="text-white font-medium mb-2">Video Unavailable</h3>
          <p className="text-gray-400 text-sm mb-4">
            {type === 'twitch' 
              ? "This Twitch stream may be offline or unavailable. Try watching directly on Twitch." 
              : "This YouTube video couldn't be loaded. Try watching directly on YouTube."}
          </p>
          <a 
            href={embedUrl.replace('embed/', 'watch?v=')} 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Watch on {type === 'twitch' ? 'Twitch' : 'YouTube'}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black rounded-lg overflow-hidden aspect-video">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-t-blue-600 border-r-transparent border-b-blue-600 border-l-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <iframe 
        src={processedUrl}
        className="w-full h-full"
        allowFullScreen
        title={title}
        onLoad={handleLoad}
        onError={handleError}
        allow="autoplay; encrypted-media; picture-in-picture"
      ></iframe>
    </div>
  );
};

export default VideoPlayer;
