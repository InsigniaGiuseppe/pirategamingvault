
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

// Generate a UUID-like string
const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback UUID generation for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Pure local registration with database integration
export const registerUser = async (
  username: string,
  password: string
): Promise<{user: CustomUser | null, session: CustomSession | null, error: string | null}> => {
  try {
    console.log('Registration attempt for:', username);
    
    // Input validation
    if (!username || username.trim().length === 0) {
      return { user: null, session: null, error: 'Username is required' };
    }
    
    if (!password || password.length === 0) {
      return { user: null, session: null, error: 'Password is required' };
    }
    
    // Check if user already exists in database
    console.log('Checking if user exists...');
    const { data: existingUser, error: checkError } = await supabase
      .from('custom_users')
      .select('username')
      .eq('username', username.toLowerCase())
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking existing user:', checkError);
      return { user: null, session: null, error: 'Registration failed: Database error while checking username' };
    }
    
    if (existingUser) {
      console.log('Username already exists');
      return { user: null, session: null, error: 'Username already exists' };
    }
    
    // Generate proper UUID for new user
    const newUserId = generateUUID();
    
    console.log('Creating user with ID:', newUserId);
    
    // Create new user in database
    const { data: dbUser, error: insertError } = await supabase
      .from('custom_users')
      .insert([{
        id: newUserId,
        username: username,
        password_hash: password // In production, this should be properly hashed
      }])
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating user in database:', insertError);
      return { user: null, session: null, error: `Registration failed: ${insertError.message || 'Could not create user'}` };
    }
    
    if (!dbUser) {
      console.error('No user data returned after insert');
      return { user: null, session: null, error: 'Registration failed: User creation returned no data' };
    }
    
    console.log('User created successfully:', dbUser);
    
    // Create initial balance for the user
    console.log('Creating initial balance...');
    const { error: balanceError } = await supabase
      .from('user_balance')
      .insert({
        user_id: dbUser.id,
        balance: 10
      });
    
    if (balanceError) {
      console.error('Error creating user balance:', balanceError);
      // Continue with registration even if balance creation fails
      console.warn('Balance creation failed but continuing with registration');
    } else {
      console.log('Initial balance created successfully');
    }
    
    // Create welcome transaction
    console.log('Creating welcome transaction...');
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: dbUser.id,
        amount: 10,
        description: 'Welcome bonus',
        type: 'admin'
      });
    
    if (transactionError) {
      console.error('Error creating welcome transaction:', transactionError);
      // Continue with registration even if transaction creation fails
      console.warn('Transaction creation failed but continuing with registration');
    } else {
      console.log('Welcome transaction created successfully');
    }
    
    const newUser: CustomUser = {
      id: dbUser.id,
      username: dbUser.username,
    };
    
    const newSession: CustomSession = {
      access_token: `mock-token-${Date.now()}`,
      expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    };
    
    // Store auth in localStorage
    console.log('Storing authentication data...');
    localStorage.setItem('pirate_user', JSON.stringify(newUser));
    localStorage.setItem('pirate_session', JSON.stringify(newSession));
    
    console.log('Registration successful for:', username, 'with ID:', newUser.id);
    return { user: newUser, session: newSession, error: null };
    
  } catch (error) {
    console.error('Unexpected registration error:', error);
    // Clear any partial localStorage data
    localStorage.removeItem('pirate_user');
    localStorage.removeItem('pirate_session');
    
    // Provide more specific error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { user: null, session: null, error: `Registration failed: ${errorMessage}` };
  }
};
