
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

// Register a new user with Supabase Auth with improved security and error handling
export const registerUser = async (
  username: string, 
  password: string
): Promise<{user: User | null, error: string | null}> => {
  try {
    // Validate inputs before proceeding
    if (!username || username.trim().length === 0) {
      return { user: null, error: 'Username is required' };
    }
    
    if (!password || password.length < 8) {
      return { user: null, error: 'Password must be at least 8 characters long' };
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
      return { user: null, error: 'Username already exists' };
    }
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error checking existing profile:', profileError);
      return { user: null, error: 'Error checking if username exists' };
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
      return { user: null, error: error.message };
    }
    
    if (!data.user) {
      console.error('No user data returned from registration');
      return { user: null, error: 'Failed to create user account' };
    }
    
    console.log('User registered successfully, initializing user balance');
    
    // Use direct table operations instead of RPC to avoid type issues
    // First create user balance entry
    const { error: balanceError } = await supabase
      .from('user_balance')
      .insert([{  // Use array syntax to be explicit about the expected type
        user_id: data.user.id,
        balance: 10
      }]);
    
    if (balanceError) {
      console.error('Error creating user balance:', balanceError);
      return { 
        user: data.user, 
        error: 'Account created but failed to initialize user balance: ' + balanceError.message 
      };
    }
    
    // Create initial welcome transaction
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert([{  // Use array syntax to be explicit about the expected type
        user_id: data.user.id,
        amount: 10,
        description: 'Welcome bonus',
        type: 'admin'
      }]);
    
    if (transactionError) {
      console.error('Error creating welcome transaction:', transactionError);
      // Non-critical error, continue despite transaction error since the account and balance were created
    }
    
    // Add user to the credentials table for admin visibility but with masked password
    const { error: credentialsError } = await supabase
      .from('credentials')
      .insert([{  // Use array syntax to be explicit about the expected type
        username: username,
        password: '********', // Store masked placeholder instead of real password
        auth_code: '010101!', // Default auth code
        active: true
      }]);
    
    if (credentialsError) {
      console.error('Error adding user to credentials table:', credentialsError);
      // Non-critical error, continue despite credentials error since the account was created
    }
    
    console.log('Registration complete for:', username);
    
    return { user: data.user, error: null };
  } catch (error) {
    console.error('Unexpected error during registration:', error);
    
    // Log the error in the console since we don't have an error_logs table
    console.error('Registration error:', {
      error_type: 'registration',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    
    return { user: null, error: `Unexpected error during registration: ${error instanceof Error ? error.message : String(error)}` };
  }
};
