
import { supabase } from "@/integrations/supabase/client";

export interface CustomUser {
  id: string;
  username: string;
  email?: string;
}

export interface CustomSession {
  access_token: string;
  expires_at: number;
}

const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const registerUser = async (
  username: string,
  password: string
): Promise<{user: CustomUser | null, session: CustomSession | null, error: string | null}> => {
  try {
    console.log('🔍 REGISTRATION DEBUG - Starting registration for:', username);
    console.log('🔍 REGISTRATION DEBUG - Current localStorage before registration:', {
      pirate_user: localStorage.getItem('pirate_user'),
      pirate_session: localStorage.getItem('pirate_session')
    });
    
    if (!username || username.trim().length === 0) {
      console.log('🔍 REGISTRATION DEBUG - Username validation failed');
      return { user: null, session: null, error: 'Username is required' };
    }
    
    if (!password || password.length === 0) {
      console.log('🔍 REGISTRATION DEBUG - Password validation failed');
      return { user: null, session: null, error: 'Password is required' };
    }

    if (password.length < 5) {
      console.log('🔍 REGISTRATION DEBUG - Password length validation failed');
      return { user: null, session: null, error: 'Password must be at least 5 characters long' };
    }

    const cleanUsername = username.toLowerCase().trim();
    console.log('🔍 REGISTRATION DEBUG - Cleaned username:', cleanUsername);
    
    // Check if user already exists
    console.log('🔍 REGISTRATION DEBUG - Checking if user exists...');
    const { data: existingUser, error: checkError } = await supabase
      .from('custom_users')
      .select('username')
      .eq('username', cleanUsername)
      .maybeSingle();
    
    console.log('🔍 REGISTRATION DEBUG - Existing user check result:', { existingUser, checkError });
    
    if (checkError) {
      console.error('🔍 REGISTRATION DEBUG - Error checking existing user:', checkError);
      return { user: null, session: null, error: 'Database error during user check' };
    }
    
    if (existingUser) {
      console.log('🔍 REGISTRATION DEBUG - User already exists');
      return { user: null, session: null, error: 'Username already exists. Please choose a different username.' };
    }
    
    const newUserId = generateUUID();
    console.log('🔍 REGISTRATION DEBUG - Creating user with ID:', newUserId);
    
    // Create user
    const { data: dbUser, error: insertError } = await supabase
      .from('custom_users')
      .insert([{
        id: newUserId,
        username: cleanUsername,
        password_hash: password
      }])
      .select()
      .single();
    
    console.log('🔍 REGISTRATION DEBUG - User creation result:', { dbUser, insertError });
    
    if (insertError || !dbUser) {
      console.error('🔍 REGISTRATION DEBUG - Error creating user:', insertError);
      return { user: null, session: null, error: `User creation failed: ${insertError?.message || 'Unknown error'}` };
    }
    
    console.log('🔍 REGISTRATION DEBUG - User created successfully, creating welcome bonus...');
    
    // Create welcome bonus using RPC function
    const { error: balanceError } = await supabase.rpc('add_coins', {
      p_user_id: dbUser.id,
      p_amount: 5,
      p_description: 'Welcome bonus'
    });
    
    console.log('🔍 REGISTRATION DEBUG - Welcome bonus creation result:', { balanceError });
    
    if (balanceError) {
      console.error('🔍 REGISTRATION DEBUG - Welcome bonus creation failed:', balanceError);
      // Clean up user if balance creation fails
      await supabase.from('custom_users').delete().eq('id', dbUser.id);
      return { user: null, session: null, error: `Welcome bonus creation failed: ${balanceError.message}` };
    }
    
    console.log('🔍 REGISTRATION DEBUG - Welcome bonus created successfully, logging activity...');
    
    // Log registration activity
    try {
      const { error: activityError } = await supabase
        .from('activity_logs')
        .insert([{
          user_id: dbUser.id,
          activity_type: 'registration',
          description: `User ${cleanUsername} registered`,
          metadata: { username: cleanUsername, timestamp: new Date().toISOString() }
        }]);
      
      console.log('🔍 REGISTRATION DEBUG - Activity logging result:', { activityError });
      
      if (activityError) {
        console.warn('🔍 REGISTRATION DEBUG - Failed to log registration activity:', activityError);
      } else {
        console.log('🔍 REGISTRATION DEBUG - Registration activity logged successfully');
      }
    } catch (activityLogError) {
      console.warn('🔍 REGISTRATION DEBUG - Non-critical: Activity logging failed:', activityLogError);
    }
    
    // Create user object and session for auto-login (expires in 24 hours as seconds)
    const newUser: CustomUser = {
      id: dbUser.id,
      username: dbUser.username,
    };
    
    const newSession: CustomSession = {
      access_token: `token-${Date.now()}-${Math.random().toString(36)}`,
      expires_at: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours from now in seconds
    };
    
    console.log('🔍 REGISTRATION DEBUG - Created user and session objects:', { newUser, newSession });
    
    // Store in localStorage for immediate login
    localStorage.setItem('pirate_user', JSON.stringify(newUser));
    localStorage.setItem('pirate_session', JSON.stringify(newSession));
    
    console.log('🔍 REGISTRATION DEBUG - Stored in localStorage, verifying storage...');
    console.log('🔍 REGISTRATION DEBUG - Verification - stored user:', localStorage.getItem('pirate_user'));
    console.log('🔍 REGISTRATION DEBUG - Verification - stored session:', localStorage.getItem('pirate_session'));
    
    console.log('🔍 REGISTRATION DEBUG - Registration completed successfully for:', cleanUsername);
    return { user: newUser, session: newSession, error: null };
    
  } catch (error) {
    console.error('🔍 REGISTRATION DEBUG - Registration error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('duplicate key') || error.message.includes('already exists')) {
        return { user: null, session: null, error: 'Username already exists. Please choose a different username.' };
      }
      return { user: null, session: null, error: error.message };
    }
    
    return { user: null, session: null, error: 'Registration failed. Please try again.' };
  }
};
