import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useToast } from '@/hooks/use-toast';
import { activityLogger } from '@/services/activityLoggingService';
import { Play, Pause, RotateCcw, CheckCircle, Clock, Coins } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  video_url: string;
  reward_amount: number;
}

interface VideoPlayerProps {
  video: Video;
  onVideoComplete?: () => void;
}

const VideoPlayer = ({ video, onVideoComplete }: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasWatched, setHasWatched] = useState(false);
  const [hasEarnedReward, setHasEarnedReward] = useState(false);
  const [videoStarted, setVideoStarted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { addPirateCoins, user } = useSimpleAuth();
  const { toast } = useToast();

  useEffect(() => {
    const watched = localStorage.getItem(`watched-${video.id}`);
    if (watched) {
      setHasWatched(true);
    }
  }, [video.id]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoStart = async () => {
    console.log('Video started:', video.title);
    setVideoStarted(true);
    setStartTime(Date.now());
    
    // Log video watch activity
    if (user?.id) {
      await activityLogger.logVideoWatched(user.id, video.id, video.title);
    }

    // Track video start analytics
    if (window.gtag) {
      window.gtag('event', 'video_start', {
        video_id: video.id,
        video_title: video.title,
        user_id: user?.id,
      });
    }
  };

  const handleVideoEnd = async () => {
    if (!videoStarted || hasEarnedReward) return;
    
    console.log('Video completed:', video.title);
    setHasEarnedReward(true);
    
    const watchDuration = startTime ? Date.now() - startTime : 0;
    
    try {
      await addPirateCoins(video.reward_amount, `Watched video: ${video.title}`);
      
      // Log video completion activity
      if (user?.id) {
        await activityLogger.logVideoCompleted(user.id, video.id, video.title, video.reward_amount);
      }
      
      toast({
        title: "Video Completed! 🎉",
        description: `You earned ${video.reward_amount} Pirate Coins for watching "${video.title}"!`,
      });

      // Track video completion analytics
      if (window.gtag) {
        window.gtag('event', 'video_complete', {
          video_id: video.id,
          video_title: video.title,
          user_id: user?.id,
          reward_amount: video.reward_amount,
          watch_duration: watchDuration,
        });
      }

      localStorage.setItem(`watched-${video.id}`, 'true');
      setHasWatched(true);
      
      if (onVideoComplete) {
        onVideoComplete();
      }
    } catch (error) {
      console.error('Error rewarding user:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was an error processing your reward. Please try again.",
      });
    }
  };

  const handleVideoError = () => {
    toast({
      variant: "destructive",
      title: "Video Error",
      description: "There was an error loading the video. Please try again later.",
    });
  };

  const resetVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {video.title}
          <Badge variant="secondary" className="opacity-80">
            <Coins size={14} className="mr-1" />
            {video.reward_amount}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <video
            ref={videoRef}
            src={video.video_url}
            className="w-full aspect-video rounded-md"
            controls={false}
            onPlay={handleVideoStart}
            onEnded={handleVideoEnd}
            onError={handleVideoError}
            muted // Ensure video is muted for autoplay
          />
          <div className="absolute top-2 left-2 flex items-center space-x-2">
            <Badge variant="outline" className="opacity-80">
              <Clock size={14} className="mr-1" />
              {/* You can add a timer here if you want */}
              Watch & Earn
            </Badge>
          </div>
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
          <Button variant="outline" onClick={togglePlay}>
            {isPlaying ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Play
              </>
            )}
          </Button>
          <Button variant="secondary" onClick={resetVideo}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoPlayer;
