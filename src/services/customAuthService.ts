
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
    console.log('🔍 LOGIN - Starting login process for:', username);
    
    // Input validation
    if (!username || username.trim().length === 0) {
      console.log('🔍 LOGIN - Username validation failed');
      return { user: null, session: null, error: 'Username is required' };
    }
    
    if (!password || password.length === 0) {
      console.log('🔍 LOGIN - Password validation failed');
      return { user: null, session: null, error: 'Password is required' };
    }

    // Clean the username to prevent issues
    const cleanUsername = username.toLowerCase().trim();
    console.log('🔍 LOGIN - Cleaned username:', cleanUsername);
    
    console.log('🔍 LOGIN - Checking user in database...');
    
    // Check user in database with direct query
    const { data: dbUser, error: loginError } = await supabase
      .from('custom_users')
      .select('*')
      .eq('username', cleanUsername)
      .eq('password_hash', password) // Simple password check for now
      .maybeSingle();
    
    console.log('🔍 LOGIN - Database query result:', { dbUser, loginError });
    
    if (loginError) {
      console.error('🔍 LOGIN - Database error:', loginError);
      return { user: null, session: null, error: 'Login failed: Database error' };
    }
    
    if (!dbUser) {
      console.log('🔍 LOGIN - No user found with provided credentials');
      return { user: null, session: null, error: 'Invalid username or password' };
    }
    
    console.log('🔍 LOGIN - User found, creating session...');
    
    const user: CustomUser = {
      id: dbUser.id,
      username: dbUser.username,
    };
    
    const session: CustomSession = {
      access_token: `token-${Date.now()}-${Math.random()}`,
      expires_at: Math.floor(Date.now() / 1000) + 86400, // 24 hours from now (more generous expiry)
    };
    
    console.log('🔍 LOGIN - About to store in localStorage:', { user, session });
    
    // Store auth in localStorage
    localStorage.setItem('pirate_user', JSON.stringify(user));
    localStorage.setItem('pirate_session', JSON.stringify(session));
    
    // Verify storage immediately
    const storedUser = localStorage.getItem('pirate_user');
    const storedSession = localStorage.getItem('pirate_session');
    console.log('🔍 LOGIN - Verification after storage:', {
      storedUser: storedUser,
      storedSession: storedSession,
      userParsed: storedUser ? JSON.parse(storedUser) : null,
      sessionParsed: storedSession ? JSON.parse(storedSession) : null
    });
    
    console.log('🔍 LOGIN - Login successful for:', username);
    return { user, session, error: null };
    
  } catch (error) {
    console.error('🔍 LOGIN - Login error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Login failed';
    return { user: null, session: null, error: errorMessage };
  }
};

export const logout = async (): Promise<void> => {
  try {
    console.log('🔍 LOGOUT - Starting logout process');
    
    // Clear localStorage
    localStorage.removeItem('pirate_user');
    localStorage.removeItem('pirate_session');
    
    console.log('🔍 LOGOUT - Logout completed, localStorage cleared');
  } catch (error) {
    console.error('🔍 LOGOUT - Logout error:', error);
  }
};

export const verifySession = async (session: CustomSession): Promise<boolean> => {
  try {
    console.log('🔍 SESSION - Verifying session:', session);
    
    // Simple expiry check for mock session
    if (session.expires_at * 1000 > Date.now()) {
      console.log('🔍 SESSION - Session is valid');
      return true;
    }
    
    console.log('🔍 SESSION - Session expired');
    return false;
  } catch (error) {
    console.error('🔍 SESSION - Session verification error:', error);
    return false;
  }
};
