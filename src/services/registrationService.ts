
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
    const { data: existingUser, error: checkError } = await supabase
      .from('custom_users')
      .select('username')
      .eq('username', username.toLowerCase())
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking existing user:', checkError);
      return { user: null, session: null, error: 'Registration failed: Database error' };
    }
    
    if (existingUser) {
      return { user: null, session: null, error: 'Username already exists' };
    }
    
    // Generate proper UUID for new user
    const { data: uuidData, error: uuidError } = await supabase.rpc('gen_random_uuid');
    
    let newUserId: string;
    if (uuidError || !uuidData) {
      // Fallback to crypto.randomUUID if available, otherwise timestamp-based
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        newUserId = crypto.randomUUID();
      } else {
        // Fallback for older browsers
        newUserId = 'user-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9);
      }
    } else {
      newUserId = uuidData;
    }
    
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
    
    if (insertError || !dbUser) {
      console.error('Error creating user in database:', insertError);
      return { user: null, session: null, error: 'Registration failed: Could not create user' };
    }
    
    console.log('User created successfully:', dbUser);
    
    // Create initial balance for the user
    const { error: balanceError } = await supabase
      .from('user_balance')
      .insert({
        user_id: dbUser.id,
        balance: 10
      });
    
    if (balanceError) {
      console.error('Error creating user balance:', balanceError);
      // Don't fail registration for this, but log it
    }
    
    // Create welcome transaction
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
      // Don't fail registration for this, but log it
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
    localStorage.setItem('pirate_user', JSON.stringify(newUser));
    localStorage.setItem('pirate_session', JSON.stringify(newSession));
    
    console.log('Registration successful for:', username, 'with ID:', newUser.id);
    return { user: newUser, session: newSession, error: null };
    
  } catch (error) {
    console.error('Registration error:', error);
    // Clear any partial localStorage data
    localStorage.removeItem('pirate_user');
    localStorage.removeItem('pirate_session');
    return { user: null, session: null, error: 'Registration failed: Unexpected error' };
  }
};
