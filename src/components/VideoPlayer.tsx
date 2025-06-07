
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

const VideoPlayer = ({ 
  type, 
  embedUrl, 
  originalUrl, 
  title, 
  onError, 
  onExternalWatch, 
  onVideoReady 
}: VideoPlayerProps) => {
  const [hasWatched, setHasWatched] = useState(false);
  const [hasEarnedReward, setHasEarnedReward] = useState(false);
  const [videoStarted, setVideoStarted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [videoError, setVideoError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadTimeout, setLoadTimeout] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { user } = useSimpleAuth();
  const { toast } = useToast();

  useEffect(() => {
    const watched = localStorage.getItem(`watched-${embedUrl}`);
    if (watched) {
      setHasWatched(true);
    }
  }, [embedUrl]);

  useEffect(() => {
    console.log('VideoPlayer mounted for:', title);
    
    // Set a timeout for video loading
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn('Video loading timeout for:', title);
        setLoadTimeout(true);
        setIsLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [title, isLoading]);

  useEffect(() => {
    if (onVideoReady) {
      console.log('Calling onVideoReady for:', title);
      onVideoReady();
    }
  }, [onVideoReady, title]);

  const handleVideoStart = async () => {
    console.log('Video started:', title);
    setVideoStarted(true);
    setStartTime(Date.now());
    setIsLoading(false);
    
    // Log video watch activity
    if (user?.id) {
      try {
        await activityLogger.logVideoWatched(user.id, embedUrl, title);
      } catch (error) {
        console.error('Failed to log video activity:', error);
      }
    }

    // Track video start analytics
    if (window.gtag) {
      window.gtag('event', 'video_start', {
        video_title: title,
        user_id: user?.id,
      });
    }
  };

  const handleVideoLoad = () => {
    console.log('Video iframe loaded for:', title);
    setIsLoading(false);
    setLoadTimeout(false);
    // Call handleVideoStart after a short delay to ensure video is ready
    setTimeout(() => {
      handleVideoStart();
    }, 1000);
  };

  const handleVideoError = () => {
    console.error('Video error for:', title);
    setVideoError(true);
    setIsLoading(false);
    
    if (onError) {
      onError();
    }
    
    toast({
      variant: "destructive",
      title: "Video Error",
      description: "There was an error loading the video. You can watch it externally instead.",
    });
  };

  const handleExternalWatch = async () => {
    console.log('Opening external watch for:', title);
    
    if (onExternalWatch) {
      try {
        await onExternalWatch();
      } catch (error) {
        console.error('External watch callback failed:', error);
      }
    }
    
    // Open the original URL in a new tab
    window.open(originalUrl, '_blank');
    
    // Track external watch analytics
    if (window.gtag) {
      window.gtag('event', 'external_video_watch', {
        video_title: title,
        user_id: user?.id,
        platform: type,
      });
    }
  };

  const handleRetry = () => {
    console.log('Retrying video load for:', title);
    setVideoError(false);
    setIsLoading(true);
    setLoadTimeout(false);
    
    // Force iframe reload
    if (iframeRef.current) {
      const currentSrc = iframeRef.current.src;
      iframeRef.current.src = '';
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = currentSrc;
        }
      }, 100);
    }
  };

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
          {videoError || loadTimeout ? (
            <div className="w-full aspect-video rounded-md bg-gray-100 flex items-center justify-center">
              <div className="text-center space-y-4">
                <AlertCircle size={48} className="text-gray-400 mx-auto" />
                <div>
                  <p className="text-gray-600 mb-2">
                    {loadTimeout ? 'Video loading timed out' : 'Video could not be embedded'}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    This might be due to network issues or video restrictions
                  </p>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button onClick={handleRetry} variant="outline" size="sm">
                    <RotateCcw size={16} className="mr-2" />
                    Try Again
                  </Button>
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
              <Badge variant="success" className="opacity-80">
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
          <Button variant="secondary" onClick={handleRetry}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reload
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoPlayer;
