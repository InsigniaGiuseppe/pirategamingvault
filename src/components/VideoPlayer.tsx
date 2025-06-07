
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useToast } from '@/hooks/use-toast';
import { activityLogger } from '@/services/activityLoggingService';
import { Play, Pause, RotateCcw, CheckCircle, Clock, ExternalLink } from 'lucide-react';

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
    if (onVideoReady) {
      onVideoReady();
    }
  }, [onVideoReady]);

  const handleVideoStart = async () => {
    console.log('Video started:', title);
    setVideoStarted(true);
    setStartTime(Date.now());
    
    // Log video watch activity
    if (user?.id) {
      await activityLogger.logVideoWatched(user.id, embedUrl, title);
    }

    // Track video start analytics
    if (window.gtag) {
      window.gtag('event', 'video_start', {
        video_title: title,
        user_id: user?.id,
      });
    }
  };

  const handleVideoError = () => {
    setVideoError(true);
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
    if (onExternalWatch) {
      await onExternalWatch();
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
          {videoError ? (
            <div className="w-full aspect-video rounded-md bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-600 mb-4">Video could not be embedded</p>
                <Button onClick={handleExternalWatch} className="flex items-center gap-2">
                  <ExternalLink size={16} />
                  Watch Externally
                </Button>
              </div>
            </div>
          ) : (
            <iframe
              ref={iframeRef}
              src={embedUrl}
              className="w-full aspect-video rounded-md"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={handleVideoStart}
              onError={handleVideoError}
            />
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
          <Button variant="secondary" onClick={() => window.location.reload()}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reload
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoPlayer;
