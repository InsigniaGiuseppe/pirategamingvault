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
  console.log('🔍 Extracting Twitch clip ID from URL:', url);
  
  // Enhanced and reordered patterns for better detection
  const patterns = [
    // Most specific patterns first
    { pattern: /clips\.twitch\.tv\/([a-zA-Z0-9_-]+)/, name: 'clips.twitch.tv format' },
    { pattern: /twitch\.tv\/clip\/([a-zA-Z0-9_-]+)/, name: 'twitch.tv/clip format' },
    { pattern: /www\.twitch\.tv\/[^\/]+\/clip\/([a-zA-Z0-9_-]+)/, name: 'www.twitch.tv/channel/clip format' },
    { pattern: /twitch\.tv\/[^\/]+\/clip\/([a-zA-Z0-9_-]+)/, name: 'twitch.tv/channel/clip format' },
    { pattern: /clips\.twitch\.tv\/embed\?clip=([a-zA-Z0-9_-]+)/, name: 'embed format' },
    // VOD clips (different handling needed)
    { pattern: /twitch\.tv\/videos\/(\d+)/, name: 'VOD format' },
    // New mobile format
    { pattern: /m\.twitch\.tv\/clip\/([a-zA-Z0-9_-]+)/, name: 'mobile clip format' },
    // Clip share URLs
    { pattern: /twitch\.tv\/.*\/clip\/([a-zA-Z0-9_-]+)/, name: 'generic clip format' }
  ];
  
  for (const { pattern, name } of patterns) {
    console.log(`📋 Testing pattern: ${name}`);
    const match = url.match(pattern);
    if (match) {
      console.log(`✅ Match found with ${name}:`, match[1]);
      return match[1];
    }
  }
  
  console.log('❌ No Twitch clip ID found in URL');
  return null;
};

export const generateYouTubeThumbnail = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

export const generateTwitchThumbnail = (channel: string): string => {
  return `https://static-cdn.jtvnw.net/previews-ttv/live_user_${channel.toLowerCase()}-440x248.jpg`;
};

export const generateTwitchClipThumbnail = (clipId: string): string => {
  return `https://clips-media-assets2.twitch.tv/${clipId}/preview-480x272.jpg`;
};

export const testUrlDetection = (url: string): { detected: string; id: string | null; patterns: string[] } => {
  console.log('🧪 Testing URL detection for:', url);
  
  const results = {
    detected: 'none',
    id: null as string | null,
    patterns: [] as string[]
  };
  
  // Test Twitch clip patterns first (most specific)
  const clipId = extractTwitchClipId(url);
  if (clipId) {
    results.detected = 'twitch-clip';
    results.id = clipId;
    results.patterns.push('Twitch Clip');
    return results;
  }
  
  // Test YouTube patterns
  const youtubeId = extractYouTubeVideoId(url);
  if (youtubeId) {
    results.detected = 'youtube';
    results.id = youtubeId;
    results.patterns.push('YouTube Video');
    return results;
  }
  
  // Test Twitch channel (only if not a clip URL)
  if (!url.includes('/clip/') && !url.includes('clips.twitch.tv')) {
    const twitchChannel = extractTwitchChannel(url);
    if (twitchChannel) {
      results.detected = 'twitch';
      results.id = twitchChannel;
      results.patterns.push('Twitch Stream');
      return results;
    }
  }
  
  console.log('❌ URL not recognized as any supported video format');
  return results;
};

export const processVideoUrl = (url: string): VideoInfo | null => {
  if (!url) return null;

  console.log('🎬 Processing video URL:', url);

  // Use the new test function for better debugging
  const detection = testUrlDetection(url);
  console.log('🎯 Detection result:', detection);

  if (detection.detected === 'twitch-clip' && detection.id) {
    console.log('✅ Detected as Twitch clip with ID:', detection.id);
    const hostname = window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname;
    return {
      id: detection.id,
      type: 'twitch-clip' as const,
      thumbnail: generateTwitchClipThumbnail(detection.id),
      embedUrl: `https://clips.twitch.tv/embed?clip=${detection.id}&parent=${hostname}&autoplay=false`,
      originalUrl: url
    };
  }

  if (detection.detected === 'youtube' && detection.id) {
    console.log('✅ Detected as YouTube video with ID:', detection.id);
    return {
      id: detection.id,
      type: 'youtube' as const,
      thumbnail: generateYouTubeThumbnail(detection.id),
      embedUrl: `https://www.youtube.com/embed/${detection.id}`,
      originalUrl: url
    };
  }

  if (detection.detected === 'twitch' && detection.id) {
    console.log('✅ Detected as Twitch channel:', detection.id);
    const hostname = window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname;
    return {
      id: detection.id,
      type: 'twitch' as const,
      thumbnail: generateTwitchThumbnail(detection.id),
      embedUrl: `https://player.twitch.tv/?channel=${detection.id}&parent=${hostname}&autoplay=false`,
      originalUrl: url
    };
  }

  console.log('❌ URL not recognized as any supported video format');
  return null;
};

export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const testTwitchClipUrl = (url: string): boolean => {
  const clipId = extractTwitchClipId(url);
  return clipId !== null;
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
