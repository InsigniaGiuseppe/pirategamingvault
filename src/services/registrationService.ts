
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

// Pure local registration with database integration
export const registerUser = async (
  username: string,
  password: string
): Promise<{user: CustomUser | null, session: CustomSession | null, error: string | null}> => {
  try {
    console.log('Registration attempt for:', username);
    
    // Input validation
    if (!username || username.trim().length === 0) {
      return { user: null, session: null, error: 'Username is required' };
    }
    
    if (!password || password.length === 0) {
      return { user: null, session: null, error: 'Password is required' };
    }
    
    // Check if user already exists in database
    const { data: existingUser, error: checkError } = await supabase
      .from('custom_users')
      .select('username')
      .eq('username', username.toLowerCase())
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking existing user:', checkError);
      return { user: null, session: null, error: 'Registration failed' };
    }
    
    if (existingUser) {
      return { user: null, session: null, error: 'Username already exists' };
    }
    
    // Create new user in database
    const newUserId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const { data: dbUser, error: insertError } = await supabase
      .from('custom_users')
      .insert([{
        id: newUserId,
        username: username,
        password_hash: password // In production, this should be properly hashed
      }])
      .select()
      .single();
    
    if (insertError || !dbUser) {
      console.error('Error creating user in database:', insertError);
      return { user: null, session: null, error: 'Registration failed' };
    }
    
    const newUser: CustomUser = {
      id: dbUser.id,
      username: dbUser.username,
    };
    
    const newSession: CustomSession = {
      access_token: `mock-token-${Date.now()}`,
      expires_at: Date.now() / 1000 + 3600,
    };
    
    // Store auth in localStorage
    localStorage.setItem('pirate_user', JSON.stringify(newUser));
    localStorage.setItem('pirate_session', JSON.stringify(newSession));
    
    console.log('Registration successful for:', username);
    return { user: newUser, session: newSession, error: null };
    
  } catch (error) {
    console.error('Registration error:', error);
    return { user: null, session: null, error: 'Registration failed' };
  }
};
