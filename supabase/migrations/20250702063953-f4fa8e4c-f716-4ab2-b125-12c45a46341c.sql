-- Create custom_users table for legacy compatibility
CREATE TABLE public.custom_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create activity_logs table
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NULL,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB NULL DEFAULT '{}',
  ip_address INET NULL,
  user_agent TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on custom_users
ALTER TABLE public.custom_users ENABLE ROW LEVEL SECURITY;

-- Enable RLS on activity_logs  
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for custom_users
CREATE POLICY "Users can view their own custom user record" 
ON public.custom_users 
FOR SELECT 
USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own custom user record" 
ON public.custom_users 
FOR UPDATE 
USING (auth.uid()::text = id::text);

-- Create RLS policies for activity_logs
CREATE POLICY "Users can view their own activity logs" 
ON public.activity_logs 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Service can insert activity logs" 
ON public.activity_logs 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_activity_type ON public.activity_logs(activity_type);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX idx_custom_users_username ON public.custom_users(username);