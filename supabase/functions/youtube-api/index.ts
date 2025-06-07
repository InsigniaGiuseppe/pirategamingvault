
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Timeout wrapper for fetch requests
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeoutMs: number = 10000): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - YouTube API took too long to respond');
    }
    throw error;
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, videoId, videoIds, playlistId } = await req.json()
    const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY')

    console.log('YouTube API request:', { action, videoId, videoIds: videoIds?.length, playlistId })

    if (!youtubeApiKey) {
      console.error('YouTube API key not configured')
      return new Response(
        JSON.stringify({ error: 'YouTube API key not configured. Please add your YOUTUBE_API_KEY to Supabase secrets.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let response
    
    if (action === 'getVideoDetails') {
      const ids = Array.isArray(videoIds) ? videoIds.join(',') : videoId
      const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${ids}&part=snippet,contentDetails,statistics&key=${youtubeApiKey}`
      
      console.log('Fetching video details for IDs:', ids)
      
      try {
        response = await fetchWithTimeout(apiUrl, {}, 15000) // 15 second timeout
        const data = await response.json()
        
        if (!response.ok) {
          console.error('YouTube API error:', data)
          throw new Error(data.error?.message || `YouTube API error: ${response.status}`)
        }
        
        console.log('Successfully fetched video details:', data.items?.length || 0, 'videos')
        
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      } catch (error) {
        console.error('Error fetching video details:', error)
        throw error
      }
    }
    
    if (action === 'getPlaylistVideos') {
      const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${playlistId}&part=snippet&maxResults=50&key=${youtubeApiKey}`
      
      console.log('Fetching playlist videos for playlist:', playlistId)
      
      try {
        response = await fetchWithTimeout(apiUrl, {}, 15000) // 15 second timeout
        const data = await response.json()
        
        if (!response.ok) {
          console.error('YouTube API error:', data)
          throw new Error(data.error?.message || `YouTube API error: ${response.status}`)
        }
        
        console.log('Successfully fetched playlist videos:', data.items?.length || 0, 'videos')
        
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      } catch (error) {
        console.error('Error fetching playlist videos:', error)
        throw error
      }
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('YouTube API error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        details: error.name === 'AbortError' ? 'Request timeout' : undefined
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
