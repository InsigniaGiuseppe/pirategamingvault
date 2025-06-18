
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
    console.log('🔐 Starting registration for:', username);
    
    if (!username || username.trim().length === 0) {
      return { user: null, session: null, error: 'Username is required' };
    }
    
    if (!password || password.length === 0) {
      return { user: null, session: null, error: 'Password is required' };
    }

    if (password.length < 5) {
      return { user: null, session: null, error: 'Password must be at least 5 characters long' };
    }

    const cleanUsername = username.toLowerCase().trim();
    
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('custom_users')
      .select('username')
      .eq('username', cleanUsername)
      .maybeSingle();
    
    if (checkError) {
      console.error('🔐 Error checking existing user:', checkError);
      return { user: null, session: null, error: 'Database error during user check' };
    }
    
    if (existingUser) {
      return { user: null, session: null, error: 'Username already exists. Please choose a different username.' };
    }
    
    const newUserId = generateUUID();
    console.log('🔐 Creating user with ID:', newUserId);
    
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
    
    if (insertError || !dbUser) {
      console.error('🔐 Error creating user:', insertError);
      return { user: null, session: null, error: `User creation failed: ${insertError?.message || 'Unknown error'}` };
    }
    
    console.log('🔐 User created successfully:', dbUser);
    
    // Create welcome bonus using RPC function
    const { error: balanceError } = await supabase.rpc('add_coins', {
      user_id: dbUser.id,
      amount: 5,
      description: 'Welcome bonus'
    });
    
    if (balanceError) {
      console.error('🔐 Welcome bonus creation failed:', balanceError);
      // Clean up user if balance creation fails
      await supabase.from('custom_users').delete().eq('id', dbUser.id);
      return { user: null, session: null, error: `Welcome bonus creation failed: ${balanceError.message}` };
    }
    
    console.log('🔐 Welcome bonus created successfully');
    
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
      
      if (activityError) {
        console.warn('🔐 Failed to log registration activity:', activityError);
      } else {
        console.log('🔐 Registration activity logged successfully');
      }
    } catch (activityLogError) {
      console.warn('🔐 Non-critical: Activity logging failed:', activityLogError);
    }
    
    // Create user object and session
    const newUser: CustomUser = {
      id: dbUser.id,
      username: dbUser.username,
    };
    
    const newSession: CustomSession = {
      access_token: `token-${Date.now()}-${Math.random().toString(36)}`,
      expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    };
    
    // Store auth in localStorage
    console.log('🔐 Storing authentication data...');
    localStorage.setItem('pirate_user', JSON.stringify(newUser));
    localStorage.setItem('pirate_session', JSON.stringify(newSession));
    
    console.log('🔐 Registration completed successfully for:', cleanUsername);
    return { user: newUser, session: newSession, error: null };
    
  } catch (error) {
    console.error('🔐 Registration error:', error);
    
    // Clear any partial localStorage data
    localStorage.removeItem('pirate_user');
    localStorage.removeItem('pirate_session');
    
    if (error instanceof Error) {
      if (error.message.includes('duplicate key') || error.message.includes('already exists')) {
        return { user: null, session: null, error: 'Username already exists. Please choose a different username.' };
      }
      return { user: null, session: null, error: error.message };
    }
    
    return { user: null, session: null, error: 'Registration failed. Please try again.' };
  }
};
