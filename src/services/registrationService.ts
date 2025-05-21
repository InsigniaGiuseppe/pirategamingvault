
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

// Register a new user with Supabase Auth
export const registerUser = async (
  username: string, 
  password: string
): Promise<{user: User | null, error: string | null}> => {
  try {
    console.log('Starting registration for:', username);
    
    // Create a standard email format using gmail.com that will pass Supabase validation
    // This is just for auth purposes and won't send actual emails
    const email = `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com`;
    
    // First check if the username already exists in profiles
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single();
    
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
    
    // Initialize user balance with 10 coins
    const { error: balanceError } = await supabase
      .from('user_balance')
      .insert({
        user_id: data.user.id, // Use UUID from Supabase Auth
        balance: 10
      });
    
    if (balanceError) {
      console.error('Error initializing user balance:', balanceError);
      return { 
        user: data.user, 
        error: 'Account created but failed to initialize balance: ' + balanceError.message 
      };
    }
    
    console.log('User balance initialized, creating welcome transaction');
    
    // Create initial welcome transaction
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: data.user.id, // Use UUID from Supabase Auth
        amount: 10,
        description: 'Welcome bonus',
        type: 'admin'
      });
    
    if (transactionError) {
      console.error('Error creating welcome transaction:', transactionError);
      // Continue despite transaction error since the account was created
    }
    
    console.log('Registration complete for:', username);
    
    return { user: data.user, error: null };
  } catch (error) {
    console.error('Unexpected error during registration:', error);
    // @ts-ignore
    return { user: null, error: `Unexpected error during registration: ${error?.message || error}` };
  }
};
