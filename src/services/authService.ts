
import { supabase } from "@/integrations/supabase/client";
import type { AuthResponse, Session, User } from "@supabase/supabase-js";

// Sign in with username, converting to internal email format for Supabase Auth
export const signInWithEmail = async (username: string, password: string): Promise<{
  session: Session | null;
  user: User | null;
  error: string | null;
}> => {
  try {
    console.log('Signing in with username:', username);
    
    // Try direct login first (for users who registered with email)
    const { data, error } = await supabase.auth.signInWithPassword({
      email: username, 
      password
    });
    
    // If direct login fails, try the username format
    if (error) {
      console.log('Direct login failed, trying username format login');
      const email = `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}@user.pirate-gaming.com`;
      
      const { data: usernameData, error: usernameError } = await supabase.auth.signInWithPassword({
        email: email,
        password
      });
      
      if (usernameError) {
        console.error('Error signing in with username format:', usernameError.message);
        return { session: null, user: null, error: 'Invalid username or password' };
      }
      
      if (!usernameData.session || !usernameData.user) {
        console.log('No session or user data returned from username login');
        return { session: null, user: null, error: 'Authentication failed' };
      }
      
      console.log('Authentication successful with username format for:', username);
      return {
        session: usernameData.session,
        user: usernameData.user,
        error: null
      };
    }
    
    if (!data.session || !data.user) {
      console.log('No session or user data returned');
      return { session: null, user: null, error: 'Authentication failed' };
    }
    
    console.log('Authentication successful for:', username);
    return {
      session: data.session,
      user: data.user,
      error: null
    };
    
  } catch (error) {
    console.error('Unexpected error during authentication:', error);
    // @ts-ignore
    return { session: null, user: null, error: error?.message || 'An unexpected error occurred' };
  }
};

// Get current session
export const getCurrentSession = async (): Promise<{
  session: Session | null;
  error: string | null;
}> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      return { session: null, error: error.message };
    }
    
    return { session: data.session, error: null };
  } catch (error) {
    console.error('Error getting session:', error);
    // @ts-ignore
    return { session: null, error: error?.message || 'An unexpected error occurred' };
  }
};

// Sign out
export const signOut = async (): Promise<{ error: string | null }> => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { error: error.message };
    }
    
    return { error: null };
  } catch (error) {
    console.error('Error signing out:', error);
    // @ts-ignore
    return { error: error?.message || 'An unexpected error occurred' };
  }
};

// Legacy function for backward compatibility
export const verifyCredentials = async (email: string, password: string) => {
  console.warn('verifyCredentials is deprecated. Use signInWithEmail instead.');
  const result = await signInWithEmail(email, password);
  return result.user ? { username: email } : null;
};
