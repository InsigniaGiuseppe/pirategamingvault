
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
    console.log('🔍 LOGIN DEBUG - Starting login process for:', username);
    console.log('🔍 LOGIN DEBUG - Current localStorage items:', {
      pirate_user: localStorage.getItem('pirate_user'),
      pirate_session: localStorage.getItem('pirate_session')
    });
    
    // Input validation
    if (!username || username.trim().length === 0) {
      console.log('🔍 LOGIN DEBUG - Username validation failed');
      return { user: null, session: null, error: 'Username is required' };
    }
    
    if (!password || password.length === 0) {
      console.log('🔍 LOGIN DEBUG - Password validation failed');
      return { user: null, session: null, error: 'Password is required' };
    }

    // Clean the username to prevent issues
    const cleanUsername = username.toLowerCase().trim();
    console.log('🔍 LOGIN DEBUG - Cleaned username:', cleanUsername);
    
    console.log('🔍 LOGIN DEBUG - Checking user in database...');
    
    // Check user in database with direct query
    const { data: dbUser, error: loginError } = await supabase
      .from('custom_users')
      .select('*')
      .eq('username', cleanUsername)
      .eq('password_hash', password) // Simple password check for now
      .maybeSingle();
    
    console.log('🔍 LOGIN DEBUG - Database query result:', { dbUser, loginError });
    
    if (loginError) {
      console.error('🔍 LOGIN DEBUG - Database error:', loginError);
      return { user: null, session: null, error: 'Login failed: Database error' };
    }
    
    if (!dbUser) {
      console.log('🔍 LOGIN DEBUG - No user found with provided credentials');
      return { user: null, session: null, error: 'Invalid username or password' };
    }
    
    console.log('🔍 LOGIN DEBUG - User found, creating session...');
    
    const user: CustomUser = {
      id: dbUser.id,
      username: dbUser.username,
    };
    
    const session: CustomSession = {
      access_token: `token-${Date.now()}`,
      expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    };
    
    console.log('🔍 LOGIN DEBUG - Created user and session:', { user, session });
    
    // Store auth in localStorage
    localStorage.setItem('pirate_user', JSON.stringify(user));
    localStorage.setItem('pirate_session', JSON.stringify(session));
    
    console.log('🔍 LOGIN DEBUG - Stored in localStorage, verifying storage...');
    console.log('🔍 LOGIN DEBUG - Verification - stored user:', localStorage.getItem('pirate_user'));
    console.log('🔍 LOGIN DEBUG - Verification - stored session:', localStorage.getItem('pirate_session'));
    
    console.log('🔍 LOGIN DEBUG - Login successful for:', username);
    return { user, session, error: null };
    
  } catch (error) {
    console.error('🔍 LOGIN DEBUG - Login error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Login failed';
    return { user: null, session: null, error: errorMessage };
  }
};

export const logout = async (): Promise<void> => {
  try {
    console.log('🔍 LOGOUT DEBUG - Starting logout process');
    console.log('🔍 LOGOUT DEBUG - Current localStorage before cleanup:', {
      pirate_user: localStorage.getItem('pirate_user'),
      pirate_session: localStorage.getItem('pirate_session')
    });
    
    // Clear localStorage
    localStorage.removeItem('pirate_user');
    localStorage.removeItem('pirate_session');
    
    console.log('🔍 LOGOUT DEBUG - Logout completed, localStorage cleared');
    console.log('🔍 LOGOUT DEBUG - Verification - localStorage after cleanup:', {
      pirate_user: localStorage.getItem('pirate_user'),
      pirate_session: localStorage.getItem('pirate_session')
    });
  } catch (error) {
    console.error('🔍 LOGOUT DEBUG - Logout error:', error);
  }
};

export const verifySession = async (session: CustomSession): Promise<boolean> => {
  try {
    console.log('🔍 SESSION DEBUG - Verifying session:', session);
    
    // Simple expiry check for mock session
    if (session.expires_at * 1000 > Date.now()) {
      console.log('🔍 SESSION DEBUG - Session is valid');
      return true;
    }
    
    console.log('🔍 SESSION DEBUG - Session expired');
    return false;
  } catch (error) {
    console.error('🔍 SESSION DEBUG - Session verification error:', error);
    return false;
  }
};
