
import { supabase } from "@/integrations/supabase/client";

// Types for our custom auth system
export interface CustomUser {
  id: string;
  username: string;
  created_at: string;
}

export interface CustomSession {
  sessionToken: string;
  expiresAt: string;
  userId: string;
}

export interface AuthResponse {
  user: CustomUser | null;
  session: CustomSession | null;
  error: string | null;
}

// Register a new user
export const registerUser = async (username: string, password: string): Promise<AuthResponse> => {
  try {
    console.log('Starting registration for:', username);
    
    const { data, error } = await supabase.functions.invoke('auth', {
      body: { username, password },
      method: 'POST',
      path: 'register'
    });
    
    if (error) {
      console.error('Error from edge function during registration:', error);
      return { user: null, session: null, error: error.message || 'Registration failed' };
    }
    
    if (!data || !data.user || !data.session) {
      console.error('Invalid response from edge function:', data);
      return { user: null, session: null, error: 'Invalid response from server' };
    }
    
    // Store session in localStorage
    localStorage.setItem('pirate_session', data.session.sessionToken);
    
    console.log('Registration successful for:', username);
    
    return { 
      user: data.user, 
      session: data.session, 
      error: null 
    };
  } catch (error) {
    console.error('Unexpected error during registration:', error);
    // @ts-ignore
    return { user: null, session: null, error: `Unexpected error: ${error?.message || error}` };
  }
};

// Login with username and password
export const login = async (username: string, password: string): Promise<AuthResponse> => {
  try {
    console.log('Logging in with username:', username);
    
    const { data, error } = await supabase.functions.invoke('auth', {
      body: { username, password },
      method: 'POST',
      path: 'login'
    });
    
    if (error) {
      console.error('Error from edge function during login:', error);
      return { user: null, session: null, error: error.message || 'Login failed' };
    }
    
    if (!data || !data.user || !data.session) {
      console.error('Invalid response from edge function:', data);
      return { user: null, session: null, error: 'Invalid response from server' };
    }
    
    // Store session in localStorage
    localStorage.setItem('pirate_session', data.session.sessionToken);
    
    console.log('Login successful for:', username);
    
    return { 
      user: data.user, 
      session: data.session,
      error: null 
    };
  } catch (error) {
    console.error('Unexpected error during login:', error);
    // @ts-ignore
    return { user: null, session: null, error: `Unexpected error: ${error?.message || error}` };
  }
};

// Verify current session
export const verifySession = async (): Promise<AuthResponse> => {
  try {
    const sessionToken = localStorage.getItem('pirate_session');
    
    if (!sessionToken) {
      return { user: null, session: null, error: null };
    }
    
    const { data, error } = await supabase.functions.invoke('auth', {
      body: { sessionToken },
      method: 'POST',
      path: 'verify'
    });
    
    if (error || !data || !data.valid) {
      // Remove invalid session
      localStorage.removeItem('pirate_session');
      return { user: null, session: null, error: error?.message || 'Invalid session' };
    }
    
    return { 
      user: data.user, 
      session: data.session, 
      error: null 
    };
  } catch (error) {
    console.error('Error verifying session:', error);
    // @ts-ignore
    return { user: null, session: null, error: `Session verification failed: ${error?.message || error}` };
  }
};

// Logout
export const logout = async (): Promise<{ error: string | null }> => {
  try {
    const sessionToken = localStorage.getItem('pirate_session');
    
    if (sessionToken) {
      // Call logout endpoint to remove session from database
      await supabase.functions.invoke('auth', {
        body: { sessionToken },
        method: 'POST',
        path: 'logout'
      });
      
      // Remove from localStorage
      localStorage.removeItem('pirate_session');
    }
    
    return { error: null };
  } catch (error) {
    console.error('Error during logout:', error);
    // Still remove from localStorage even if the server call fails
    localStorage.removeItem('pirate_session');
    // @ts-ignore
    return { error: `Logout failed: ${error?.message || error}` };
  }
};
