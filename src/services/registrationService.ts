
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

// Register a new user with Supabase Auth with improved security and error handling
export const registerUser = async (
  username: string, 
  password: string
): Promise<{user: User | null, session: any | null, error: string | null}> => {
  try {
    // Validate inputs before proceeding
    if (!username || username.trim().length === 0) {
      return { user: null, session: null, error: 'Username is required' };
    }
    
    if (!password || password.length < 5) {
      return { user: null, session: null, error: 'Password must be at least 5 characters long' };
    }
    
    console.log('Starting registration for:', username);
    
    // Create a standard email format using gmail.com that will pass Supabase validation
    // This is just for auth purposes and won't send actual emails
    const email = `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com`;
    
    // First check if the username already exists in profiles
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .maybeSingle();
    
    if (existingProfile) {
      console.log('Username already exists:', existingProfile);
      return { user: null, session: null, error: 'Username already exists' };
    }
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error checking existing profile:', profileError);
      return { user: null, session: null, error: 'Error checking if username exists' };
    }
    
    console.log('Username is available, proceeding with registration with email:', email);
    
    // Register user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        }
      }
    });
    
    if (error) {
      console.error('Error registering user:', error.message);
      return { user: null, session: null, error: error.message };
    }
    
    if (!data.user) {
      console.error('No user data returned from registration');
      return { user: null, session: null, error: 'Failed to create user account' };
    }
    
    console.log('User registered successfully, database trigger will handle balance initialization');
    
    // Return the user and session
    // Note: The balance initialization will be handled by a database trigger
    return { 
      user: data.user, 
      session: data.session, 
      error: null 
    };
  } catch (error) {
    console.error('Unexpected error during registration:', error);
    
    // Log the error in the console since we don't have an error_logs table
    console.error('Registration error:', {
      error_type: 'registration',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    
    return { 
      user: null, 
      session: null, 
      error: `Unexpected error during registration: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};
