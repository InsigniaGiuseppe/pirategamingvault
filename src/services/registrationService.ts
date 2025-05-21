
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { checkPasswordCompromised } from "@/utils/passwordSecurity";

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
    
    // Check if password has been compromised (server-side verification)
    const isCompromised = await checkPasswordCompromised(password);
    if (isCompromised) {
      console.error('Password found in data breaches');
      return { user: null, session: null, error: 'This password has been found in data breaches. Please choose a different password for your security.' };
    }
    
    console.log('Starting registration for:', username);
    
    // Normalize username by removing all special characters and spaces
    const normalizedUsername = username.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Create a standard email format using gmail.com that will pass Supabase validation
    const email = `${normalizedUsername}@gmail.com`;
    
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
    
    return { 
      user: data.user, 
      session: data.session, 
      error: null 
    };
  } catch (error) {
    console.error('Unexpected error during registration:', error);
    return { 
      user: null, 
      session: null, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
};
