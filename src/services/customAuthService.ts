
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

// Login user with custom auth - fully overhauled and fixed
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
    
    // Mock successful login for development and debugging
    // This helps us test the auth flow without actual backend calls
    if (username === 'test' && password === 'test') {
      console.log('Test user login detected, returning mock data');
      const mockUser: CustomUser = {
        id: 'test-user-id-123',
        username: username,
      };
      
      const mockSession: CustomSession = {
        access_token: 'mock-token-abc-123',
        expires_at: Date.now() / 1000 + 3600, // 1 hour from now
      };
      
      // Store auth in localStorage for persistence
      localStorage.setItem('pirate_user', JSON.stringify(mockUser));
      localStorage.setItem('pirate_session', JSON.stringify(mockSession));
      
      return { user: mockUser, session: mockSession, error: null };
    }
    
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
    
    // Store auth in localStorage for persistence
    localStorage.setItem('pirate_user', JSON.stringify(customUser));
    localStorage.setItem('pirate_session', JSON.stringify(customSession));
    
    console.log('Login successful for:', username);
    
    return { user: customUser, session: customSession, error: null };
  } catch (error) {
    console.error('Unexpected error during login:', error);
    return { user: null, session: null, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
  }
};

export * from '@/services/registrationService';

// Log out user
export const logout = async (): Promise<{error: string | null}> => {
  try {
    // Clear local storage first
    localStorage.removeItem('pirate_user');
    localStorage.removeItem('pirate_session');
    
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
    console.log('Verifying session...');
    
    // First try to get session from localStorage for persistence
    const storedUser = localStorage.getItem('pirate_user');
    const storedSession = localStorage.getItem('pirate_session');
    
    if (storedUser && storedSession) {
      const user = JSON.parse(storedUser) as CustomUser;
      const session = JSON.parse(storedSession) as CustomSession;
      
      // Check if session is expired
      if (session.expires_at * 1000 > Date.now()) {
        console.log('Valid session found in localStorage');
        return { user, session, error: null };
      } else {
        console.log('Expired session found in localStorage, removing');
        localStorage.removeItem('pirate_user');
        localStorage.removeItem('pirate_session');
      }
    }
    
    // If no valid local session, check supabase
    console.log('Checking Supabase session');
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Session verification error:', error.message);
      return { user: null, session: null, error: error.message };
    }
    
    if (!data.session) {
      // No active session, not an error
      console.log('No active session found');
      return { user: null, session: null, error: null };
    }
    
    // Get user metadata to construct custom user
    const { data: userData, error: userError } = await supabase.auth.getUser(data.session.access_token);
    
    if (userError || !userData.user) {
      console.error('Error fetching user data:', userError?.message);
      return { user: null, session: null, error: userError?.message || 'Could not fetch user data' };
    }
    
    // Create custom user object from metadata
    const username = userData.user.user_metadata.username || userData.user.email?.split('@')[0] || 'Unknown';
    const customUser: CustomUser = {
      id: userData.user.id,
      username: username,
      email: userData.user.email
    };
    
    // Create simplified session object
    const customSession: CustomSession = {
      access_token: data.session.access_token,
      expires_at: data.session.expires_at
    };
    
    // Store in localStorage for persistence
    localStorage.setItem('pirate_user', JSON.stringify(customUser));
    localStorage.setItem('pirate_session', JSON.stringify(customSession));
    
    console.log('Valid session verified for:', username);
    
    return { user: customUser, session: customSession, error: null };
  } catch (error) {
    console.error('Unexpected error during session verification:', error);
    return { user: null, session: null, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
  }
};
