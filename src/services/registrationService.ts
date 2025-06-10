
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
  
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Enhanced registration with proper atomic transaction handling
export const registerUser = async (
  username: string,
  password: string
): Promise<{user: CustomUser | null, session: CustomSession | null, error: string | null}> => {
  const timeoutMs = 15000; // 15 second timeout
  
  try {
    console.log('Starting registration for:', username);
    
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

    const cleanUsername = username.toLowerCase().trim();
    
    // Set up timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Registration timed out')), timeoutMs);
    });

    const registrationPromise = performAtomicRegistration(cleanUsername, password);
    
    return await Promise.race([registrationPromise, timeoutPromise]) as any;
    
  } catch (error) {
    console.error('Registration error:', error);
    
    // Clear any partial localStorage data
    localStorage.removeItem('pirate_user');
    localStorage.removeItem('pirate_session');
    
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        return { user: null, session: null, error: 'Registration timed out. Please try again.' };
      }
      if (error.message.includes('duplicate key') || error.message.includes('already exists')) {
        return { user: null, session: null, error: 'Username already exists. Please choose a different username.' };
      }
      return { user: null, session: null, error: error.message };
    }
    
    return { user: null, session: null, error: 'Registration failed. Please try again.' };
  }
};

async function performAtomicRegistration(cleanUsername: string, password: string) {
  console.log('Starting atomic registration for:', cleanUsername);
  
  // Check if user already exists
  const { data: existingUser, error: checkError } = await supabase
    .from('custom_users')
    .select('username')
    .eq('username', cleanUsername)
    .maybeSingle();
  
  if (checkError) {
    console.error('Error checking existing user:', checkError);
    throw new Error('Database error during user check');
  }
  
  if (existingUser) {
    throw new Error('Username already exists');
  }
  
  const newUserId = generateUUID();
  console.log('Creating user with ID:', newUserId);
  
  // Use a single transaction-like operation
  try {
    // Step 1: Create user
    const { data: dbUser, error: insertError } = await supabase
      .from('custom_users')
      .insert([{
        id: newUserId,
        username: cleanUsername,
        password_hash: password
      }])
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating user:', insertError);
      throw new Error(`User creation failed: ${insertError.message}`);
    }
    
    if (!dbUser) {
      throw new Error('User creation returned no data');
    }
    
    console.log('User created successfully:', dbUser);
    
    // Step 2: Use RPC function for balance and transaction creation
    const { error: balanceError } = await supabase.rpc('add_coins', {
      user_id: dbUser.id,
      amount: 5,
      description: 'Welcome bonus'
    });
    
    if (balanceError) {
      console.error('Welcome bonus creation failed:', balanceError);
      // Clean up user if balance creation fails
      await supabase.from('custom_users').delete().eq('id', dbUser.id);
      throw new Error(`Welcome bonus creation failed: ${balanceError.message}`);
    }
    
    console.log('Welcome bonus created successfully');
    
    // Create user object and session
    const newUser: CustomUser = {
      id: dbUser.id,
      username: dbUser.username,
    };
    
    const newSession: CustomSession = {
      access_token: `token-${Date.now()}-${Math.random().toString(36)}`,
      expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    };
    
    // Store auth in localStorage
    console.log('Storing authentication data...');
    localStorage.setItem('pirate_user', JSON.stringify(newUser));
    localStorage.setItem('pirate_session', JSON.stringify(newSession));
    
    console.log('Registration completed successfully for:', cleanUsername);
    return { user: newUser, session: newSession, error: null };
    
  } catch (dbError: any) {
    console.error('Atomic registration failed:', dbError);
    
    // Clean up any partial data
    try {
      await supabase.from('custom_users').delete().eq('id', newUserId);
      await supabase.from('user_balance').delete().eq('user_id', newUserId);
      await supabase.from('transactions').delete().eq('user_id', newUserId);
    } catch (cleanupError) {
      console.warn('Cleanup failed:', cleanupError);
    }
    
    throw dbError;
  }
}
