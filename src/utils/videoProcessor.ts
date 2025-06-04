
export interface VideoInfo {
  id: string;
  type: 'youtube' | 'twitch';
  title?: string;
  thumbnail: string;
  duration?: string;
  durationDisplay?: string;
  embedUrl: string;
  originalUrl: string;
}

export const extractYouTubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

export const extractTwitchChannel = (url: string): string | null => {
  const match = url.match(/twitch\.tv\/([a-zA-Z0-9_]+)/);
  return match ? match[1] : null;
};

export const generateYouTubeThumbnail = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

export const generateTwitchThumbnail = (channel: string): string => {
  // For now, use a placeholder since Twitch API requires authentication
  // In a real implementation, you'd use the Twitch API
  return `https://static-cdn.jtvnw.net/previews-ttv/live_user_${channel.toLowerCase()}-440x248.jpg`;
};

export const processVideoUrl = (url: string): VideoInfo | null => {
  if (!url) return null;

  // Check if it's a YouTube URL
  const youtubeId = extractYouTubeVideoId(url);
  if (youtubeId) {
    return {
      id: youtubeId,
      type: 'youtube',
      thumbnail: generateYouTubeThumbnail(youtubeId),
      embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
      originalUrl: url
    };
  }

  // Check if it's a Twitch URL
  const twitchChannel = extractTwitchChannel(url);
  if (twitchChannel) {
    return {
      id: twitchChannel,
      type: 'twitch',
      thumbnail: generateTwitchThumbnail(twitchChannel),
      embedUrl: `https://player.twitch.tv/?channel=${twitchChannel}&parent=${window.location.hostname}`,
      originalUrl: url
    };
  }

  return null;
};

export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const getWorkingVideoExamples = () => [
  {
    id: '1',
    type: 'youtube',
    title: 'Beautiful Nature Landscapes',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duration: '212',
    durationDisplay: '3:32',
    reward: 15,
    url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  {
    id: '2',
    type: 'youtube',
    title: 'Relaxing Music for Focus',
    thumbnail: 'https://img.youtube.com/vi/jfKfPfyJRdk/maxresdefault.jpg',
    duration: '180',
    durationDisplay: '3:00',
    reward: 12,
    url: 'https://youtube.com/watch?v=jfKfPfyJRdk',
    embedUrl: 'https://www.youtube.com/embed/jfKfPfyJRdk'
  },
  {
    id: '3',
    type: 'twitch',
    title: 'Live Gaming Stream',
    thumbnail: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_shroud-440x248.jpg',
    duration: '300',
    durationDisplay: '5:00',
    reward: 20,
    url: 'https://twitch.tv/shroud',
    embedUrl: `https://player.twitch.tv/?channel=shroud&parent=${window.location.hostname}`
  }
];
