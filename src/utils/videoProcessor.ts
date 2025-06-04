
export interface VideoInfo {
  id: string;
  type: 'youtube' | 'twitch' | 'twitch-clip';
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
  const match = url.match(/twitch\.tv\/([a-zA-Z0-9_]+)(?:\/|$)/);
  return match ? match[1] : null;
};

export const extractTwitchClipId = (url: string): string | null => {
  // Handle both clips.twitch.tv and twitch.tv/*/clip/ formats
  const patterns = [
    /clips\.twitch\.tv\/([a-zA-Z0-9_-]+)/,
    /twitch\.tv\/[^\/]+\/clip\/([a-zA-Z0-9_-]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

export const generateYouTubeThumbnail = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

export const generateTwitchThumbnail = (channel: string): string => {
  return `https://static-cdn.jtvnw.net/previews-ttv/live_user_${channel.toLowerCase()}-440x248.jpg`;
};

export const generateTwitchClipThumbnail = (clipId: string): string => {
  // For clips, we'll use a placeholder thumbnail since we'd need API access for real thumbnails
  return `https://clips-media-assets2.twitch.tv/${clipId}/preview-480x272.jpg`;
};

export const processVideoUrl = (url: string): VideoInfo | null => {
  if (!url) return null;

  // Check if it's a Twitch clip first (more specific)
  const clipId = extractTwitchClipId(url);
  if (clipId) {
    const hostname = window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname;
    return {
      id: clipId,
      type: 'twitch-clip' as const,
      thumbnail: generateTwitchClipThumbnail(clipId),
      embedUrl: `https://clips.twitch.tv/embed?clip=${clipId}&parent=${hostname}&autoplay=false`,
      originalUrl: url
    };
  }

  // Check if it's a YouTube URL
  const youtubeId = extractYouTubeVideoId(url);
  if (youtubeId) {
    return {
      id: youtubeId,
      type: 'youtube' as const,
      thumbnail: generateYouTubeThumbnail(youtubeId),
      embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
      originalUrl: url
    };
  }

  // Check if it's a Twitch channel
  const twitchChannel = extractTwitchChannel(url);
  if (twitchChannel) {
    const hostname = window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname;
    return {
      id: twitchChannel,
      type: 'twitch' as const,
      thumbnail: generateTwitchThumbnail(twitchChannel),
      embedUrl: `https://player.twitch.tv/?channel=${twitchChannel}&parent=${hostname}&autoplay=false`,
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
    type: 'youtube' as const,
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
    type: 'youtube' as const,
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
    type: 'youtube' as const,
    title: 'Coding Tutorial - JavaScript Basics',
    thumbnail: 'https://img.youtube.com/vi/W6NZfCO5SIk/maxresdefault.jpg',
    duration: '300',
    durationDisplay: '5:00',
    reward: 20,
    url: 'https://youtube.com/watch?v=W6NZfCO5SIk',
    embedUrl: 'https://www.youtube.com/embed/W6NZfCO5SIk'
  },
  {
    id: '4',
    type: 'twitch-clip' as const,
    title: 'Epic Gaming Moment (Twitch Clip)',
    thumbnail: 'https://clips-media-assets2.twitch.tv/example/preview-480x272.jpg',
    duration: '30',
    durationDisplay: '0:30',
    reward: 10,
    url: 'https://clips.twitch.tv/FunnyClipSlug',
    embedUrl: `https://clips.twitch.tv/embed?clip=FunnyClipSlug&parent=${window.location.hostname}&autoplay=false`
  }
];
