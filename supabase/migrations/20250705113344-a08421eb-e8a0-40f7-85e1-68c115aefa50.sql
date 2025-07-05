-- First, add the missing transaction types to the enum
ALTER TYPE public.transaction_type ADD VALUE IF NOT EXISTS 'earn';
ALTER TYPE public.transaction_type ADD VALUE IF NOT EXISTS 'spend'; 
ALTER TYPE public.transaction_type ADD VALUE IF NOT EXISTS 'admin';

-- Create video_analytics table for tracking video interactions
CREATE TABLE public.video_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID NOT NULL,
  user_id UUID,
  action TEXT NOT NULL,
  watch_duration INTEGER,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for video_analytics
ALTER TABLE public.video_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for video_analytics
CREATE POLICY "Users can view their own video analytics" 
ON public.video_analytics 
FOR SELECT 
USING (auth.uid()::text = user_id::text OR user_id IS NULL);

CREATE POLICY "Anyone can insert video analytics" 
ON public.video_analytics 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for video_analytics
CREATE INDEX idx_video_analytics_video_id ON public.video_analytics(video_id);
CREATE INDEX idx_video_analytics_user_id ON public.video_analytics(user_id);
CREATE INDEX idx_video_analytics_action ON public.video_analytics(action);
CREATE INDEX idx_video_analytics_created_at ON public.video_analytics(created_at);