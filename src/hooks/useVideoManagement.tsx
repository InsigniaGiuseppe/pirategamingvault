
import { useState, useEffect, useCallback } from 'react';
import { getVideos, trackVideoAnalytics, Video } from '@/services/videoService';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useToast } from '@/hooks/use-toast';

export const useVideoManagement = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watchedVideos, setWatchedVideos] = useState<Set<string>>(new Set());
  const { user } = useSimpleAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadVideos();
    loadWatchedVideos();
  }, [user]);

  const loadVideos = useCallback(async () => {
    try {
      console.log('Loading videos from database...');
      setLoading(true);
      setError(null);
      
      const data = await getVideos(false);
      console.log('Videos loaded successfully:', data);
      
      setVideos(data);
      setLoading(false);
      
      if (data.length === 0) {
        setError('No videos available at the moment');
      }
    } catch (error) {
      console.error('Error loading videos:', error);
      setError('Failed to load videos. Please try again.');
      setVideos([]);
      setLoading(false);
    }
  }, []);

  const loadWatchedVideos = useCallback(() => {
    if (user) {
      const watchedVideosStr = localStorage.getItem(`${user.username}_watchedVideos`);
      if (watchedVideosStr) {
        try {
          const watchedIds = JSON.parse(watchedVideosStr);
          setWatchedVideos(new Set(watchedIds));
        } catch (e) {
          setWatchedVideos(new Set());
        }
      }
    }
  }, [user]);

  const markVideoWatched = useCallback((videoId: string) => {
    const newWatched = new Set(watchedVideos);
    newWatched.add(videoId);
    setWatchedVideos(newWatched);
    
    if (user) {
      const watchedArray = Array.from(newWatched);
      localStorage.setItem(`${user.username}_watchedVideos`, JSON.stringify(watchedArray));
    }
  }, [watchedVideos, user]);

  const trackAnalytics = useCallback(async (
    videoId: string, 
    action: 'view' | 'complete' | 'skip',
    watchDuration?: number
  ) => {
    try {
      await trackVideoAnalytics(videoId, action, user?.id, watchDuration);
    } catch (error) {
      // Silent fail for analytics
    }
  }, [user?.id]);

  return {
    videos,
    loading,
    error,
    watchedVideos,
    loadVideos,
    markVideoWatched,
    trackAnalytics
  };
};
