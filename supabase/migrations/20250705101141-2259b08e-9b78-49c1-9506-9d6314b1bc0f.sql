-- Create videos table
CREATE TABLE public.videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id TEXT NOT NULL UNIQUE,
  platform_type TEXT NOT NULL DEFAULT 'youtube',
  title TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 0,
  thumbnail_url TEXT,
  description TEXT,
  tags TEXT[],
  coin_reward INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for videos
CREATE POLICY "Videos are viewable by everyone" 
ON public.videos 
FOR SELECT 
USING (is_active = true);

-- Create indexes
CREATE INDEX idx_videos_platform_type ON public.videos(platform_type);
CREATE INDEX idx_videos_is_featured ON public.videos(is_featured);
CREATE INDEX idx_videos_is_active ON public.videos(is_active);