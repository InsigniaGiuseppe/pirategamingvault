-- Create unlocked_games table
CREATE TABLE public.unlocked_games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  game_id TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, game_id)
);

-- Enable RLS
ALTER TABLE public.unlocked_games ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own unlocked games" 
ON public.unlocked_games 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own unlocked games" 
ON public.unlocked_games 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

-- Create additional RPC functions needed
CREATE OR REPLACE FUNCTION public.remove_coins(p_user_id uuid, p_amount numeric, p_description text DEFAULT NULL::text, p_coin_id uuid DEFAULT NULL::uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Call the existing subtract_coins function
    PERFORM public.subtract_coins(p_user_id, p_amount, p_description, p_coin_id);
END;
$function$;