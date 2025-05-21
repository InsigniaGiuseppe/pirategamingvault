
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { encode as encodeHex } from "https://deno.land/std@0.177.0/encoding/hex.ts"
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

// Hash password function (using native crypto instead of bcrypt)
async function hashPassword(password: string): Promise<string> {
  console.log('Hashing password using native crypto');
  // Generate a random salt
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = encodeHex(salt);
  
  // Encode password to bytes
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(password + saltHex);
  
  // Hash using SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', passwordBytes);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Return salt + hash combined
  return `${saltHex}:${hashHex}`;
}

// Verify password function
async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  console.log('Verifying password using native crypto');
  const [saltHex, knownHashHex] = storedHash.split(':');
  
  // Encode password with known salt
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(password + saltHex);
  
  // Hash using SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', passwordBytes);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Compare hashes
  return hashHex === knownHashHex;
}

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
  console.log('Auth function called with method:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { action } = body
    console.log('Action requested:', action);
    
    // Register endpoint
    if (action === 'register' && req.method === 'POST') {
      const { username, password } = body
      console.log('Attempting to register user:', username);
      
      // Validate inputs
      if (!username || !password) {
        console.log('Missing username or password');
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
        console.log('Username already exists:', username);
        return new Response(
          JSON.stringify({ error: 'Username already exists' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      try {
        // Hash password using our native crypto implementation
        console.log('Hashing password');
        const passwordHash = await hashPassword(password);
        
        // Create user
        console.log('Creating user in database');
        const { data: user, error: createError } = await supabase
          .from('custom_users')
          .insert({ 
            username, 
            password_hash: passwordHash 
          })
          .select('id, username, created_at')
          .single()
        
        if (createError) {
          console.error('Error creating user:', createError);
          return new Response(
            JSON.stringify({ error: 'Error creating user account' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        // Generate session
        console.log('Generating session for user:', user.id);
        const session = await generateSession(user.id)
        
        // Initialize user balance
        const { error: balanceError } = await supabase
          .from('user_balance')
          .insert({
            user_id: user.id,
            balance: 10
          })
        
        if (balanceError) {
          console.error('Error initializing balance:', balanceError);
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
          console.error('Error creating welcome transaction:', transactionError);
        }
        
        // Create profile entry
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username: username
          })
        
        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
        
        console.log('Registration successful for user:', username);
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
      } catch (hashError) {
        console.error('Error during password hashing:', hashError);
        return new Response(
          JSON.stringify({ error: 'Internal server error during account creation' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }
    
    // Login endpoint
    if (action === 'login' && req.method === 'POST') {
      const { username, password } = body
      console.log('Attempting to login user:', username);
      
      // Validate inputs
      if (!username || !password) {
        console.log('Missing username or password');
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
        console.log('User not found:', username);
        return new Response(
          JSON.stringify({ error: 'Invalid username or password' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      try {
        // Verify password
        console.log('Verifying password');
        const validPassword = await verifyPassword(password, user.password_hash);
        
        if (!validPassword) {
          console.log('Invalid password for user:', username);
          return new Response(
            JSON.stringify({ error: 'Invalid username or password' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        // Generate session
        console.log('Generating session for user:', user.id);
        const session = await generateSession(user.id)
        
        console.log('Login successful for user:', username);
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
      } catch (compareError) {
        console.error('Error during password verification:', compareError);
        return new Response(
          JSON.stringify({ error: 'Internal server error during login' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }
    
    // Verify session endpoint
    if (action === 'verify' && req.method === 'POST') {
      const { sessionToken } = body
      console.log('Verifying session token');
      
      if (!sessionToken) {
        console.log('No session token provided');
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
        console.log('Invalid or expired session token');
        return new Response(
          JSON.stringify({ error: 'Invalid or expired session' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // Check if session is expired
      if (new Date(session.expires_at) < new Date()) {
        console.log('Session has expired');
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
        console.log('User not found for session');
        return new Response(
          JSON.stringify({ error: 'User not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      console.log('Session verified successfully for user:', user.username);
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
      console.log('Logging out session');
      
      if (!sessionToken) {
        console.log('No session token provided for logout');
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
        console.error('Failed to logout:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to logout' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      console.log('Logout successful');
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Handle unknown endpoint
    console.log('Unknown action requested:', action);
    return new Response(
      JSON.stringify({ error: 'Endpoint not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
