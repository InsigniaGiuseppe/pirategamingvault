
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

// Pure local login with database verification
export const login = async (
  username: string,
  password: string
): Promise<{user: CustomUser | null, session: CustomSession | null, error: string | null}> => {
  try {
    console.log('Login attempt for:', username);
    
    // Input validation
    if (!username || username.trim().length === 0) {
      return { user: null, session: null, error: 'Username is required' };
    }
    
    if (!password || password.length === 0) {
      return { user: null, session: null, error: 'Password is required' };
    }
    
    // Check user in database
    const { data: dbUser, error: loginError } = await supabase
      .from('custom_users')
      .select('*')
      .eq('username', username.toLowerCase())
      .eq('password_hash', password) // In production, compare hashed passwords
      .maybeSingle();
    
    if (loginError) {
      console.error('Login error:', loginError);
      return { user: null, session: null, error: 'Login failed' };
    }
    
    if (!dbUser) {
      return { user: null, session: null, error: 'Invalid username or password' };
    }
    
    const user: CustomUser = {
      id: dbUser.id,
      username: dbUser.username,
    };
    
    const session: CustomSession = {
      access_token: `mock-token-${Date.now()}`,
      expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now in seconds
    };
    
    // Store auth in localStorage
    localStorage.setItem('pirate_user', JSON.stringify(user));
    localStorage.setItem('pirate_session', JSON.stringify(session));
    
    console.log('Login successful for:', username);
    return { user, session, error: null };
    
  } catch (error) {
    console.error('Login error:', error);
    return { user: null, session: null, error: 'Login failed' };
  }
};

export const logout = async (): Promise<void> => {
  try {
    console.log('Starting logout process');
    
    // Clear localStorage
    localStorage.removeItem('pirate_user');
    localStorage.removeItem('pirate_session');
    
    console.log('Logout completed');
  } catch (error) {
    console.error('Logout error:', error);
  }
};

export const verifySession = async (session: CustomSession): Promise<boolean> => {
  try {
    console.log('Verifying session...');
    
    // Simple expiry check for mock session
    if (session.expires_at * 1000 > Date.now()) {
      console.log('Session is valid');
      return true;
    }
    
    console.log('Session expired');
    return false;
  } catch (error) {
    console.error('Session verification error:', error);
    return false;
  }
};
