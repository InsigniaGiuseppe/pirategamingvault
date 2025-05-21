
import { supabase } from "@/integrations/supabase/client";
import type { AuthResponse, Session, User } from "@supabase/supabase-js";

// Sign in with email and password using Supabase Auth
export const signInWithEmail = async (email: string, password: string): Promise<{
  session: Session | null;
  user: User | null;
  error: string | null;
}> => {
  try {
    console.log('Signing in with email:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('Error signing in:', error.message);
      return { session: null, user: null, error: error.message };
    }
    
    if (!data.session || !data.user) {
      console.log('No session or user data returned');
      return { session: null, user: null, error: 'Authentication failed' };
    }
    
    console.log('Authentication successful for:', data.user.email);
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
