
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

// Add timeout wrapper for database operations
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number = 10000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
    )
  ]);
};

// Pure local login with database verification and timeout protection
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

    // Clean the username to prevent issues
    const cleanUsername = username.toLowerCase().trim();
    
    console.log('Checking user in database with timeout protection...');
    
    // Check user in database with timeout protection - properly await the query
    const dbUserQuery = supabase
      .from('custom_users')
      .select('*')
      .eq('username', cleanUsername)
      .eq('password_hash', password) // Simple password check for now
      .maybeSingle();
    
    const { data: dbUser, error: loginError } = await withTimeout(dbUserQuery, 5000);
    
    if (loginError) {
      console.error('Login database error:', loginError);
      return { user: null, session: null, error: 'Login failed: Database error' };
    }
    
    if (!dbUser) {
      console.log('No user found with provided credentials');
      return { user: null, session: null, error: 'Invalid username or password' };
    }
    
    console.log('User found, creating session...');
    
    const user: CustomUser = {
      id: dbUser.id,
      username: dbUser.username,
    };
    
    const session: CustomSession = {
      access_token: `token-${Date.now()}`,
      expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    };
    
    // Store auth in localStorage
    localStorage.setItem('pirate_user', JSON.stringify(user));
    localStorage.setItem('pirate_session', JSON.stringify(session));
    
    console.log('Login successful for:', username);
    return { user, session, error: null };
    
  } catch (error) {
    console.error('Login error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Login failed';
    return { user: null, session: null, error: errorMessage };
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
