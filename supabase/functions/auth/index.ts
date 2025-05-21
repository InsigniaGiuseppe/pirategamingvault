
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import * as bcrypt from 'https://deno.land/x/bcrypt@v0.4.0/mod.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.5'
import { v4 as uuidv4 } from 'https://esm.sh/uuid@9.0.0'

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Create a Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

// Generate a session that expires in 30 days
const generateSession = async (userId: string) => {
  const sessionToken = uuidv4()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30) // 30 days from now
  
  const { error } = await supabase
    .from('user_sessions')
    .insert({
      user_id: userId,
      session_token: sessionToken,
      expires_at: expiresAt.toISOString(),
    })
  
  if (error) throw new Error(`Failed to create session: ${error.message}`)
  
  return { 
    sessionToken,
    expiresAt: expiresAt.toISOString(),
    userId 
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { action } = body
    
    // Register endpoint
    if (action === 'register' && req.method === 'POST') {
      const { username, password } = body
      
      // Validate inputs
      if (!username || !password) {
        return new Response(
          JSON.stringify({ error: 'Username and password are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // Check if username already exists
      const { data: existingUser } = await supabase
        .from('custom_users')
        .select('username')
        .eq('username', username)
        .single()
      
      if (existingUser) {
        return new Response(
          JSON.stringify({ error: 'Username already exists' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // Hash password
      const passwordHash = await bcrypt.hash(password)
      
      // Create user
      const { data: user, error: createError } = await supabase
        .from('custom_users')
        .insert({ 
          username, 
          password_hash: passwordHash 
        })
        .select('id, username, created_at')
        .single()
      
      if (createError) {
        console.error('Error creating user:', createError)
        return new Response(
          JSON.stringify({ error: 'Error creating user account' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // Generate session
      const session = await generateSession(user.id)
      
      // Initialize user balance
      const { error: balanceError } = await supabase
        .from('user_balance')
        .insert({
          user_id: user.id,
          balance: 10
        })
      
      if (balanceError) {
        console.error('Error initializing balance:', balanceError)
      }
      
      // Create welcome transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          amount: 10,
          description: 'Welcome bonus',
          type: 'admin'
        })
      
      if (transactionError) {
        console.error('Error creating welcome transaction:', transactionError)
      }
      
      // Create profile entry
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          username: username
        })
      
      if (profileError) {
        console.error('Error creating profile:', profileError)
      }
      
      return new Response(
        JSON.stringify({ 
          user: { 
            id: user.id, 
            username: user.username,
            created_at: user.created_at
          }, 
          session 
        }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Login endpoint
    if (action === 'login' && req.method === 'POST') {
      const { username, password } = body
      
      // Validate inputs
      if (!username || !password) {
        return new Response(
          JSON.stringify({ error: 'Username and password are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // Find user
      const { data: user, error: findError } = await supabase
        .from('custom_users')
        .select('id, username, password_hash, created_at')
        .eq('username', username)
        .single()
      
      if (findError || !user) {
        return new Response(
          JSON.stringify({ error: 'Invalid username or password' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // Verify password
      const validPassword = await bcrypt.compare(password, user.password_hash)
      
      if (!validPassword) {
        return new Response(
          JSON.stringify({ error: 'Invalid username or password' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // Generate session
      const session = await generateSession(user.id)
      
      // Return user and session
      return new Response(
        JSON.stringify({ 
          user: { 
            id: user.id, 
            username: user.username,
            created_at: user.created_at 
          }, 
          session 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Verify session endpoint
    if (action === 'verify' && req.method === 'POST') {
      const { sessionToken } = body
      
      if (!sessionToken) {
        return new Response(
          JSON.stringify({ error: 'No session token provided' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // Find session
      const { data: session, error: sessionError } = await supabase
        .from('user_sessions')
        .select('user_id, expires_at')
        .eq('session_token', sessionToken)
        .single()
      
      if (sessionError || !session) {
        return new Response(
          JSON.stringify({ error: 'Invalid or expired session' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // Check if session is expired
      if (new Date(session.expires_at) < new Date()) {
        // Delete expired session
        await supabase
          .from('user_sessions')
          .delete()
          .eq('session_token', sessionToken)
        
        return new Response(
          JSON.stringify({ error: 'Session expired' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // Get user
      const { data: user, error: userError } = await supabase
        .from('custom_users')
        .select('id, username, created_at')
        .eq('id', session.user_id)
        .single()
      
      if (userError || !user) {
        return new Response(
          JSON.stringify({ error: 'User not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      return new Response(
        JSON.stringify({ 
          valid: true, 
          user: {
            id: user.id,
            username: user.username,
            created_at: user.created_at
          },
          session: {
            sessionToken,
            expiresAt: session.expires_at,
            userId: session.user_id
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Logout endpoint
    if (action === 'logout' && req.method === 'POST') {
      const { sessionToken } = body
      
      if (!sessionToken) {
        return new Response(
          JSON.stringify({ error: 'No session token provided' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // Delete session
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('session_token', sessionToken)
      
      if (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to logout' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Handle unknown endpoint
    return new Response(
      JSON.stringify({ error: 'Endpoint not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
