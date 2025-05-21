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

// Improved password hashing with more secure parameters
async function hashPassword(password: string): Promise<string> {
  // Generate a random 16-byte salt
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = encodeHex(salt);
  
  // Create an encoder for the password
  const encoder = new TextEncoder();
  
  // Combine password with salt for additional security
  const passwordBytes = encoder.encode(password + saltHex);
  
  // Use SHA-256 for hashing (in production, PBKDF2 or Argon2 would be better but requires additional libraries)
  const hashBuffer = await crypto.subtle.digest('SHA-256', passwordBytes);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Return salt + hash combined
  return `${saltHex}:${hashHex}`;
}

// Verify password function with consistent time comparison
async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const [saltHex, knownHashHex] = storedHash.split(':');
    if (!saltHex || !knownHashHex) {
      console.error('Invalid hash format');
      return false;
    }
    
    // Encode password with known salt
    const encoder = new TextEncoder();
    const passwordBytes = encoder.encode(password + saltHex);
    
    // Hash using SHA-256
    const hashBuffer = await crypto.subtle.digest('SHA-256', passwordBytes);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Constant time comparison to prevent timing attacks
    let result = hashHex.length === knownHashHex.length;
    let differenceFound = false;
    
    for (let i = 0; i < Math.max(hashHex.length, knownHashHex.length); i++) {
      if (i < hashHex.length && i < knownHashHex.length) {
        if (hashHex.charAt(i) !== knownHashHex.charAt(i) && !differenceFound) {
          differenceFound = true;
          result = false;
        }
      } else {
        result = false;
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error during password verification:', error);
    return false;
  }
}

// Generate a session with configurable expiration
const generateSession = async (userId: string, expiresInDays = 30) => {
  try {
    const sessionToken = uuidv4()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresInDays)
    
    const { error } = await supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
      })
    
    if (error) {
      console.error('Session creation error:', error);
      throw new Error(`Failed to create session: ${error.message}`)
    }
    
    return { 
      sessionToken,
      expiresAt: expiresAt.toISOString(),
      userId 
    }
  } catch (error) {
    console.error('Unexpected error during session creation:', error);
    throw new Error('Failed to create user session');
  }
}

// Log metrics for request monitoring
const logRequestMetrics = async (action: string, success: boolean, duration: number, errorMessage?: string) => {
  try {
    const { error } = await supabase.from('auth_metrics').insert({
      action,
      success,
      duration_ms: duration,
      error_message: errorMessage || null,
      timestamp: new Date().toISOString()
    });
    
    if (error) {
      console.error('Failed to log metrics:', error);
    }
  } catch (err) {
    console.error('Error logging metrics:', err);
    // Non-blocking, will continue even if metrics logging fails
  }
}

serve(async (req) => {
  const requestStart = performance.now();
  let metricSuccess = false;
  let metricError: string | undefined;
  let action = 'unknown';
  
  console.log('Auth function called with method:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    action = body?.action || 'unknown';
    console.log('Action requested:', action);
    
    // Enhanced validation
    if (!body || typeof body !== 'object') {
      metricError = 'Invalid request body';
      return new Response(
        JSON.stringify({ error: metricError }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Register endpoint
    if (action === 'register' && req.method === 'POST') {
      const { username, password } = body;
      console.log('Attempting to register user:', username);
      
      // Input validation with specific error messages
      if (!username) {
        metricError = 'Username is required';
        return new Response(
          JSON.stringify({ error: metricError }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (!password) {
        metricError = 'Password is required';
        return new Response(
          JSON.stringify({ error: metricError }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Modified: Simplified password requirements for development
      if (password.length < 5) {
        metricError = 'Password must be at least 5 characters long';
        return new Response(
          JSON.stringify({ error: metricError }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Removed complex password validation to match frontend requirements
      
      // Check if username already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle();
      
      if (existingProfile) {
        console.log('Username already exists:', existingProfile);
        metricError = 'Username already exists';
        return new Response(
          JSON.stringify({ error: metricError }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      try {
        // Hash password with improved security
        const passwordHash = await hashPassword(password);
        
        // Create user with transaction to ensure data consistency
        let user;
        
        // Create user in transaction to ensure data consistency
        const { data, error } = await supabase.rpc('create_user_complete', {
          p_username: username,
          p_password_hash: passwordHash,
          p_initial_balance: 10,
          p_welcome_message: 'Welcome bonus'
        });
        
        if (error) {
          console.error('Error in user creation transaction:', error);
          metricError = 'Error creating user account';
          return new Response(
            JSON.stringify({ error: metricError }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        user = data;
        
        if (!user) {
          metricError = 'User creation failed';
          return new Response(
            JSON.stringify({ error: metricError }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Generate session
        const session = await generateSession(user.id);
        
        // Also add the user to the credentials table for admin visibility
        const { error: credentialsError } = await supabase
          .from('credentials')
          .insert({
            username: username,
            password: '********', // Store a masked placeholder for admin visibility
            auth_code: '010101!', // Default auth code
            active: true
          });
        
        if (credentialsError) {
          console.error('Error adding user to credentials table:', credentialsError);
          // Non-critical error, continue
        }
        
        metricSuccess = true;
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
        );
      } catch (error) {
        console.error('Error during user registration:', error);
        metricError = 'Internal server error during account creation';
        return new Response(
          JSON.stringify({ error: metricError }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Login endpoint with rate limiting
    if (action === 'login' && req.method === 'POST') {
      const { username, password } = body;
      console.log('Attempting to login user:', username);
      
      // Basic validation
      if (!username || !password) {
        metricError = 'Username and password are required';
        return new Response(
          JSON.stringify({ error: metricError }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Check for rate limiting (simple implementation)
      const cacheKey = `login_attempts:${username}`;
      const { data: loginAttempts } = await supabase
        .from('rate_limits')
        .select('attempts, last_attempt')
        .eq('key', cacheKey)
        .single();
      
      const now = new Date();
      
      if (loginAttempts && loginAttempts.attempts >= 5) {
        const lastAttempt = new Date(loginAttempts.last_attempt);
        const minutesSinceLastAttempt = (now.getTime() - lastAttempt.getTime()) / 60000;
        
        if (minutesSinceLastAttempt < 15) {
          metricError = 'Too many login attempts, please try again later';
          return new Response(
            JSON.stringify({ 
              error: metricError,
              retryAfter: Math.ceil(15 - minutesSinceLastAttempt)
            }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
      
      // Find user
      const { data: user, error: findError } = await supabase
        .from('custom_users')
        .select('id, username, password_hash, created_at')
        .eq('username', username)
        .single();
      
      // Update login attempt count
      const newAttemptCount = (loginAttempts?.attempts || 0) + 1;
      await supabase
        .from('rate_limits')
        .upsert({
          key: cacheKey,
          attempts: newAttemptCount,
          last_attempt: now.toISOString()
        }, {
          onConflict: 'key'
        });
      
      if (findError || !user) {
        metricError = 'Invalid username or password';
        return new Response(
          JSON.stringify({ error: metricError }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      try {
        // Verify password
        const validPassword = await verifyPassword(password, user.password_hash);
        
        if (!validPassword) {
          metricError = 'Invalid username or password';
          return new Response(
            JSON.stringify({ error: metricError }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Reset login attempts on successful login
        await supabase
          .from('rate_limits')
          .upsert({
            key: cacheKey,
            attempts: 0,
            last_attempt: now.toISOString()
          }, {
            onConflict: 'key'
          });
        
        // Generate session
        const session = await generateSession(user.id);
        
        metricSuccess = true;
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
        );
      } catch (error) {
        console.error('Error during login:', error);
        metricError = 'Internal server error during login';
        return new Response(
          JSON.stringify({ error: metricError }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Verify session endpoint
    if (action === 'verify' && req.method === 'POST') {
      const { sessionToken } = body;
      console.log('Verifying session token');
      
      if (!sessionToken) {
        metricError = 'No session token provided';
        return new Response(
          JSON.stringify({ error: metricError }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Find session with caching layer
      const { data: session, error: sessionError } = await supabase
        .from('user_sessions')
        .select('user_id, expires_at')
        .eq('session_token', sessionToken)
        .single();
      
      if (sessionError || !session) {
        metricError = 'Invalid or expired session';
        return new Response(
          JSON.stringify({ error: metricError }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Check if session is expired
      if (new Date(session.expires_at) < new Date()) {
        console.log('Session has expired');
        // Delete expired session
        await supabase
          .from('user_sessions')
          .delete()
          .eq('session_token', sessionToken);
        
        metricError = 'Session expired';
        return new Response(
          JSON.stringify({ error: metricError }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Get user with optimized query
      const { data: user, error: userError } = await supabase
        .from('custom_users')
        .select('id, username, created_at')
        .eq('id', session.user_id)
        .single();
      
      if (userError || !user) {
        metricError = 'User not found';
        return new Response(
          JSON.stringify({ error: metricError }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      metricSuccess = true;
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
      );
    }
    
    // Logout endpoint
    if (action === 'logout' && req.method === 'POST') {
      const { sessionToken } = body;
      console.log('Logging out session');
      
      if (!sessionToken) {
        metricError = 'No session token provided';
        return new Response(
          JSON.stringify({ error: metricError }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Delete session
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('session_token', sessionToken);
      
      if (error) {
        console.error('Failed to logout:', error);
        metricError = 'Failed to logout';
        return new Response(
          JSON.stringify({ error: metricError }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      metricSuccess = true;
      console.log('Logout successful');
      
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Handle unknown endpoint
    metricError = 'Endpoint not found';
    console.log('Unknown action requested:', action);
    return new Response(
      JSON.stringify({ error: metricError }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error in auth function:', error);
    metricError = 'Internal server error';
    return new Response(
      JSON.stringify({ error: metricError }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } finally {
    // Log metrics for monitoring (non-blocking)
    const requestDuration = performance.now() - requestStart;
    EdgeRuntime.waitUntil(
      logRequestMetrics(action, metricSuccess, requestDuration, metricError)
    );
  }
})
