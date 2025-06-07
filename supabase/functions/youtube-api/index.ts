
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, videoId, videoIds, playlistId } = await req.json()
    const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY')

    if (!youtubeApiKey) {
      return new Response(
        JSON.stringify({ error: 'YouTube API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let response
    
    if (action === 'getVideoDetails') {
      const ids = Array.isArray(videoIds) ? videoIds.join(',') : videoId
      const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${ids}&part=snippet,contentDetails,statistics&key=${youtubeApiKey}`
      
      response = await fetch(apiUrl)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'YouTube API error')
      }
      
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    if (action === 'getPlaylistVideos') {
      const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${playlistId}&part=snippet&maxResults=50&key=${youtubeApiKey}`
      
      response = await fetch(apiUrl)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'YouTube API error')
      }
      
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('YouTube API error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
