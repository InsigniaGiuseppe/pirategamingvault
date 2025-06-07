import { supabase } from '@/integrations/supabase/client';
import { extractYouTubeVideoId, processVideoUrl } from '@/utils/videoProcessor';

export interface Video {
  id: string;
  video_id: string;
  platform_type: 'youtube' | 'twitch' | 'twitch-clip';
  title: string;
  description?: string;
  duration: number;
  duration_display: string;
  thumbnail_url: string;
  embed_url: string;
  original_url: string;
  reward_amount: number;
  is_active: boolean;
  view_count: number;
  completion_count: number;
  category?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface YouTubeVideoData {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      maxres?: { url: string };
      high: { url: string };
      medium: { url: string };
    };
    channelTitle: string;
  };
  contentDetails: {
    duration: string; // ISO 8601 format like "PT4M13S"
  };
  statistics: {
    viewCount: string;
  };
}

interface VideoInsert {
  video_id: string;
  platform_type: 'youtube' | 'twitch' | 'twitch-clip';
  title: string;
  description?: string;
  duration: number;
  duration_display: string;
  thumbnail_url: string;
  embed_url: string;
  original_url: string;
  reward_amount: number;
  is_active: boolean;
  view_count: number;
  completion_count: number;
  category?: string;
  tags?: string[];
}

const parseDuration = (isoDuration: string): number => {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  return hours * 3600 + minutes * 60 + seconds;
};

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const calculateReward = (duration: number, isShort: boolean = false): number => {
  // Special handling for YouTube Shorts (typically under 60 seconds)
  if (isShort || duration <= 60) {
    return Math.max(3, Math.ceil(duration / 15)); // 3-4 coins for shorts
  }
  
  // Base reward calculation: 1 coin per 30 seconds, minimum 5, maximum 50
  const baseReward = Math.ceil(duration / 30);
  return Math.max(5, Math.min(50, baseReward));
};

export const fetchYouTubeVideoData = async (videoIds: string[]): Promise<YouTubeVideoData[]> => {
  console.log('🎬 Fetching YouTube data for', videoIds.length, 'videos');
  
  try {
    const { data, error } = await supabase.functions.invoke('youtube-api', {
      body: { action: 'getVideoDetails', videoIds }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw error;
    }
    
    if (data.error) {
      console.error('YouTube API error:', data.error);
      throw new Error(data.error);
    }
    
    console.log('✅ Successfully fetched YouTube data for', data.items?.length || 0, 'videos');
    return data.items || [];
  } catch (error) {
    console.error('Error fetching YouTube video data:', error);
    throw error;
  }
};

export const processYouTubeUrls = async (urls: string[]): Promise<VideoInsert[]> => {
  const videoIds: string[] = [];
  const urlMap: { [key: string]: string } = {};
  const shortsMap: { [key: string]: boolean } = {};
  
  console.log('🔍 Processing', urls.length, 'URLs...');
  
  // Extract video IDs and create mapping
  urls.forEach(url => {
    const videoId = extractYouTubeVideoId(url);
    if (videoId) {
      videoIds.push(videoId);
      urlMap[videoId] = url;
      shortsMap[videoId] = url.includes('/shorts/');
      console.log(`📹 ${shortsMap[videoId] ? 'Short' : 'Video'} detected:`, videoId);
    } else {
      console.warn('❌ Could not extract video ID from URL:', url);
    }
  });

  if (videoIds.length === 0) {
    throw new Error('No valid YouTube video URLs found');
  }

  console.log('🎯 Processing', videoIds.length, 'valid video IDs');

  // Process videos in smaller batches to prevent timeouts
  const batchSize = 10;
  const allVideoData: YouTubeVideoData[] = [];
  
  for (let i = 0; i < videoIds.length; i += batchSize) {
    const batch = videoIds.slice(i, i + batchSize);
    console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}:`, batch.length, 'videos');
    
    try {
      const batchData = await fetchYouTubeVideoData(batch);
      allVideoData.push(...batchData);
      console.log(`✅ Batch ${Math.floor(i / batchSize) + 1} completed`);
    } catch (error) {
      console.error(`❌ Batch ${Math.floor(i / batchSize) + 1} failed:`, error);
      // Continue with other batches instead of failing completely
    }
  }
  
  console.log('🎬 Processing', allVideoData.length, 'videos from YouTube API');
  
  return allVideoData.map(video => {
    const duration = parseDuration(video.contentDetails.duration);
    const isShort = shortsMap[video.id];
    const thumbnail = video.snippet.thumbnails.maxres?.url || 
                     video.snippet.thumbnails.high.url || 
                     video.snippet.thumbnails.medium.url;
    
    console.log(`📋 ${isShort ? 'Short' : 'Video'} "${video.snippet.title}": ${formatDuration(duration)}, ${calculateReward(duration, isShort)} coins`);
    
    return {
      video_id: video.id,
      platform_type: 'youtube' as const,
      title: video.snippet.title,
      description: video.snippet.description,
      duration,
      duration_display: formatDuration(duration),
      thumbnail_url: thumbnail,
      embed_url: `https://www.youtube.com/embed/${video.id}`,
      original_url: urlMap[video.id],
      reward_amount: calculateReward(duration, isShort),
      is_active: true,
      view_count: 0,
      completion_count: 0,
      category: isShort ? 'shorts' : undefined,
      tags: isShort ? ['shorts'] : undefined
    };
  });
};

export const saveVideos = async (videos: VideoInsert[]): Promise<Video[]> => {
  const { data, error } = await supabase
    .from('videos')
    .insert(videos)
    .select();

  if (error) throw error;
  
  // Type assertion since we know the data matches our Video interface
  return (data || []) as Video[];
};

export const getVideos = async (includeInactive = false): Promise<Video[]> => {
  let query = supabase.from('videos').select('*').order('created_at', { ascending: false });
  
  if (!includeInactive) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;

  if (error) throw error;
  
  // Type assertion since we know the data matches our Video interface
  return (data || []) as Video[];
};

export const updateVideo = async (id: string, updates: Partial<Video>): Promise<Video> => {
  const { data, error } = await supabase
    .from('videos')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  
  // Type assertion since we know the data matches our Video interface
  return data as Video;
};

export const deleteVideo = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('videos')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const trackVideoAnalytics = async (
  videoId: string, 
  action: 'view' | 'complete' | 'skip',
  userId?: string,
  watchDuration?: number
): Promise<void> => {
  const { error } = await supabase
    .from('video_analytics')
    .insert({
      video_id: videoId,
      user_id: userId,
      action,
      watch_duration: watchDuration,
      session_id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });

  if (error) {
    console.error('Failed to track video analytics:', error);
  }
};
