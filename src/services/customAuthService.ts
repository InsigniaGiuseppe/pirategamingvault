
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

// Login user with custom auth
export const login = async (
  username: string,
  password: string
): Promise<{user: CustomUser | null, session: CustomSession | null, error: string | null}> => {
  try {
    // Input validation with specific error messages
    if (!username || username.trim().length === 0) {
      return { user: null, session: null, error: 'Username is required' };
    }
    
    if (!password || password.length === 0) {
      return { user: null, session: null, error: 'Password is required' };
    }
    
    // Create a standard email format for auth purposes
    // Normalize username by removing all special characters and spaces
    const normalizedUsername = username.toLowerCase().replace(/[^a-z0-9]/g, '');
    const email = `${normalizedUsername}@gmail.com`;
    
    console.log('Attempting login with email:', email);
    
    // Try to sign in with the constructed email
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('Login error:', error.message);
      return { user: null, session: null, error: error.message };
    }
    
    if (!data.user || !data.session) {
      return { user: null, session: null, error: 'Invalid credentials' };
    }
    
    // Extract username from metadata or use email prefix
    const displayUsername = data.user.user_metadata?.username || normalizedUsername;
    
    // Create custom user object
    const customUser: CustomUser = {
      id: data.user.id,
      username: displayUsername,
      email: data.user.email
    };
    
    // Create simplified session object
    const customSession: CustomSession = {
      access_token: data.session.access_token,
      expires_at: data.session.expires_at
    };
    
    console.log('Login successful for:', username);
    console.log('User data:', customUser);
    console.log('Session data:', { 
      access_token: data.session.access_token.substring(0, 10) + '...', 
      expires_at: data.session.expires_at
    });
    
    return { user: customUser, session: customSession, error: null };
  } catch (error) {
    console.error('Unexpected error during login:', error);
    return { user: null, session: null, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
  }
};

// Register user with custom auth (re-exporting from registration service)
export const registerUser = async (
  username: string,
  password: string
): Promise<{user: CustomUser | null, session: CustomSession | null, error: string | null}> => {
  try {
    // Implementation will use the registrationService
    const regResult = await import('@/services/registrationService').then(module => 
      module.registerUser(username, password)
    );
    
    if (regResult.error || !regResult.user) {
      return { 
        user: null,
        session: null, 
        error: regResult.error || 'Registration failed'
      };
    }
    
    // Create custom user and session objects
    const customUser: CustomUser = {
      id: regResult.user.id,
      username: username,
      email: regResult.user.email
    };
    
    // Login after registration to get session
    const { data, error } = await supabase.auth.getSession();
    
    if (error || !data.session) {
      console.error('Error getting session after registration:', error);
      return { 
        user: customUser, 
        session: null, 
        error: 'Account created but could not retrieve session'
      };
    }
    
    const customSession: CustomSession = {
      access_token: data.session.access_token,
      expires_at: data.session.expires_at
    };
    
    return { user: customUser, session: customSession, error: null };
  } catch (error) {
    console.error('Unexpected error during registration:', error);
    return { 
      user: null, 
      session: null, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred during registration'
    };
  }
};

// Log out user
export const logout = async (): Promise<{error: string | null}> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
      return { error: error.message };
    }
    
    return { error: null };
  } catch (error) {
    console.error('Unexpected error during logout:', error);
    return { error: error instanceof Error ? error.message : 'An unexpected error occurred' };
  }
};

// Verify if user is authenticated and return current session
export const verifySession = async (): Promise<{user: CustomUser | null, session: CustomSession | null, error: string | null}> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Session verification error:', error.message);
      return { user: null, session: null, error: error.message };
    }
    
    if (!data.session) {
      // No active session, not an error
      return { user: null, session: null, error: null };
    }
    
    // Get user metadata to construct custom user
    const { data: userData, error: userError } = await supabase.auth.getUser(data.session.access_token);
    
    if (userError || !userData.user) {
      console.error('Error fetching user data:', userError?.message);
      return { user: null, session: null, error: userError?.message || 'Could not fetch user data' };
    }
    
    // Create custom user object from metadata
    const customUser: CustomUser = {
      id: userData.user.id,
      username: userData.user.user_metadata.username || userData.user.email?.split('@')[0] || 'Unknown',
      email: userData.user.email
    };
    
    // Create simplified session object
    const customSession: CustomSession = {
      access_token: data.session.access_token,
      expires_at: data.session.expires_at
    };
    
    return { user: customUser, session: customSession, error: null };
  } catch (error) {
    console.error('Unexpected error during session verification:', error);
    return { user: null, session: null, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
  }
};
