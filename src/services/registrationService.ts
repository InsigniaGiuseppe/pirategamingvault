
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

// Add timeout wrapper for database operations
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number = 10000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
    )
  ]);
};

// Pure local registration with database integration and timeout protection
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

    if (password.length < 5) {
      return { user: null, session: null, error: 'Password must be at least 5 characters long' };
    }

    // Clean the username to prevent issues
    const cleanUsername = username.toLowerCase().trim();
    
    console.log('Checking if user exists with timeout protection...');
    
    // Check if user already exists in database with timeout - properly await the query
    const existingUserQuery = supabase
      .from('custom_users')
      .select('username')
      .eq('username', cleanUsername)
      .maybeSingle();
    
    const { data: existingUser, error: checkError } = await withTimeout(existingUserQuery, 5000);
    
    if (checkError) {
      console.error('Error checking existing user:', checkError);
      return { user: null, session: null, error: 'Registration failed: Database error' };
    }
    
    if (existingUser) {
      console.log('Username already exists');
      return { user: null, session: null, error: 'Username already exists' };
    }
    
    // Generate proper UUID for new user
    const newUserId = generateUUID();
    
    console.log('Creating user with ID:', newUserId);
    
    // Create new user in database with timeout protection - properly await the query
    const insertUserQuery = supabase
      .from('custom_users')
      .insert([{
        id: newUserId,
        username: cleanUsername,
        password_hash: password // Store password directly for simplicity
      }])
      .select()
      .single();
    
    const { data: dbUser, error: insertError } = await withTimeout(insertUserQuery, 5000);
    
    if (insertError) {
      console.error('Error creating user in database:', insertError);
      return { user: null, session: null, error: `Registration failed: ${insertError.message}` };
    }
    
    if (!dbUser) {
      console.error('No user data returned after insert');
      return { user: null, session: null, error: 'Registration failed: User creation returned no data' };
    }
    
    console.log('User created successfully:', dbUser);
    
    // Create initial balance with timeout protection - properly await the query
    console.log('Creating initial balance...');
    try {
      const balanceQuery = supabase
        .from('user_balance')
        .insert({
          user_id: dbUser.id,
          balance: 10
        });
      
      await withTimeout(balanceQuery, 3000);
      console.log('Initial balance created successfully');
    } catch (balanceError) {
      console.warn('Balance creation failed but continuing with registration:', balanceError);
    }
    
    // Create welcome transaction with timeout protection - properly await the query
    console.log('Creating welcome transaction...');
    try {
      const transactionQuery = supabase
        .from('transactions')
        .insert({
          user_id: dbUser.id,
          amount: 10,
          description: 'Welcome bonus',
          type: 'admin'
        });
      
      await withTimeout(transactionQuery, 3000);
      console.log('Welcome transaction created successfully');
    } catch (transactionError) {
      console.warn('Transaction creation failed but continuing with registration:', transactionError);
    }
    
    const newUser: CustomUser = {
      id: dbUser.id,
      username: dbUser.username,
    };
    
    const newSession: CustomSession = {
      access_token: `token-${Date.now()}`,
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
    const errorMessage = error instanceof Error ? error.message : 'Registration failed';
    return { user: null, session: null, error: errorMessage };
  }
};
