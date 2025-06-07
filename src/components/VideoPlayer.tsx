
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useToast } from '@/hooks/use-toast';
import { activityLogger } from '@/services/activityLoggingService';
import { Play, Pause, RotateCcw, CheckCircle, Clock, ExternalLink, AlertCircle } from 'lucide-react';

interface VideoPlayerProps {
  type: 'youtube' | 'twitch' | 'twitch-clip';
  embedUrl: string;
  originalUrl: string;
  title: string;
  onError?: () => void;
  onExternalWatch?: () => Promise<void>;
  onVideoReady?: () => void;
}

const VideoPlayer = React.memo(({ 
  type, 
  embedUrl, 
  originalUrl, 
  title, 
  onError, 
  onExternalWatch, 
  onVideoReady 
}: VideoPlayerProps) => {
  const [hasWatched, setHasWatched] = useState(false);
  const [videoStarted, setVideoStarted] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadTimeout, setLoadTimeout] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const { user } = useSimpleAuth();
  const { toast } = useToast();

  const MAX_RETRIES = 2;
  const LOAD_TIMEOUT = 10000; // Increased to 10 seconds

  useEffect(() => {
    const watched = localStorage.getItem(`watched-${embedUrl}`);
    if (watched) {
      setHasWatched(true);
    }
  }, [embedUrl]);

  useEffect(() => {
    if (onVideoReady && !isLoading && !videoError) {
      onVideoReady();
    }
  }, [onVideoReady, isLoading, videoError]);

  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a more generous timeout for video loading
    timeoutRef.current = setTimeout(() => {
      if (isLoading && !videoError) {
        console.log('Video loading timeout reached');
        setLoadTimeout(true);
        setIsLoading(false);
        // Don't automatically call onError here, let user choose external watch
      }
    }, LOAD_TIMEOUT);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading, videoError, retryCount]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleVideoStart = async () => {
    console.log('Video started successfully');
    setVideoStarted(true);
    setIsLoading(false);
    setLoadTimeout(false);
    
    if (user?.id) {
      try {
        await activityLogger.logVideoWatched(user.id, embedUrl, title);
      } catch (error) {
        // Silent fail for analytics
      }
    }

    if (window.gtag) {
      window.gtag('event', 'video_start', {
        video_title: title,
        user_id: user?.id,
      });
    }
  };

  const handleVideoLoad = () => {
    console.log('Video iframe loaded');
    setIsLoading(false);
    setLoadTimeout(false);
    setVideoError(false);
    
    // Give a brief moment for the iframe content to initialize
    setTimeout(() => {
      handleVideoStart();
    }, 1000);
  };

  const handleVideoError = () => {
    console.log('Video loading error occurred');
    setVideoError(true);
    setIsLoading(false);
    
    if (onError) {
      onError();
    }
  };

  const handleExternalWatch = async () => {
    console.log('Opening external watch');
    
    if (onExternalWatch) {
      try {
        await onExternalWatch();
      } catch (error) {
        console.error('External watch error:', error);
      }
    }
    
    window.open(originalUrl, '_blank');
    
    if (window.gtag) {
      window.gtag('event', 'external_video_watch', {
        video_title: title,
        user_id: user?.id,
        platform: type,
      });
    }
  };

  const handleRetry = () => {
    if (retryCount >= MAX_RETRIES) {
      toast({
        variant: "destructive",
        title: "Maximum retries reached",
        description: "Please try watching externally instead.",
      });
      return;
    }

    console.log(`Retrying video load (attempt ${retryCount + 1})`);
    setVideoError(false);
    setIsLoading(true);
    setLoadTimeout(false);
    setRetryCount(prev => prev + 1);
    
    if (iframeRef.current) {
      const currentSrc = iframeRef.current.src;
      iframeRef.current.src = '';
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = currentSrc;
        }
      }, 500);
    }
  };

  const shouldShowError = videoError || loadTimeout;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <Badge variant="secondary" className="opacity-80">
            <Clock size={14} className="mr-1" />
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          {shouldShowError ? (
            <div className="w-full aspect-video rounded-md bg-gray-100 flex items-center justify-center">
              <div className="text-center space-y-4 p-6">
                <AlertCircle size={48} className="text-gray-400 mx-auto" />
                <div>
                  <p className="text-gray-600 mb-2 font-medium">
                    {loadTimeout ? 'Video loading is taking longer than expected' : 'Video could not be loaded'}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    {loadTimeout 
                      ? 'The video might still be loading. You can wait or watch externally.' 
                      : 'This might be due to network issues or video restrictions'}
                  </p>
                  {retryCount > 0 && (
                    <p className="text-xs text-gray-400">
                      Attempts: {retryCount}/{MAX_RETRIES}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 justify-center">
                  {retryCount < MAX_RETRIES && (
                    <Button onClick={handleRetry} variant="outline" size="sm">
                      <RotateCcw size={16} className="mr-2" />
                      Try Again
                    </Button>
                  )}
                  <Button onClick={handleExternalWatch} className="flex items-center gap-2">
                    <ExternalLink size={16} />
                    Watch Externally
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10 rounded-md">
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-gray-600 text-sm">Loading video...</p>
                    {retryCount > 0 && (
                      <p className="text-xs text-gray-400 mt-1">
                        Attempt {retryCount + 1}
                      </p>
                    )}
                  </div>
                </div>
              )}
              <iframe
                ref={iframeRef}
                src={embedUrl}
                className="w-full aspect-video rounded-md"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={handleVideoLoad}
                onError={handleVideoError}
              />
            </>
          )}
          
          <div className="absolute bottom-2 right-2 flex items-center space-x-2">
            {hasWatched && (
              <Badge variant="default" className="bg-green-600">
                <CheckCircle size={14} className="mr-1" />
                Watched
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={handleExternalWatch}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Watch Externally
          </Button>
          {shouldShowError && retryCount < MAX_RETRIES && (
            <Button variant="secondary" onClick={handleRetry}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reload ({retryCount}/{MAX_RETRIES})
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;
