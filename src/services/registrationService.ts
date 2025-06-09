
import { supabase } from "@/integrations/supabase/client";
import { DatabaseService } from "./databaseService";

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

// Enhanced registration with proper transaction handling and timeout
export const registerUser = async (
  username: string,
  password: string
): Promise<{user: CustomUser | null, session: CustomSession | null, error: string | null}> => {
  const timeoutMs = 10000; // 10 second timeout
  
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

    // Clean the username to prevent issues
    const cleanUsername = username.toLowerCase().trim();
    
    // Set up timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Registration timed out')), timeoutMs);
    });

    // Main registration logic
    const registrationPromise = performRegistration(cleanUsername, password);
    
    // Race between registration and timeout
    return await Promise.race([registrationPromise, timeoutPromise]) as any;
    
  } catch (error) {
    console.error('Registration error:', error);
    
    // Clear any partial localStorage data
    localStorage.removeItem('pirate_user');
    localStorage.removeItem('pirate_session');
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        return { user: null, session: null, error: 'Registration timed out. Please try again.' };
      }
      if (error.message.includes('duplicate key')) {
        return { user: null, session: null, error: 'Username already exists. Please choose a different username.' };
      }
      return { user: null, session: null, error: error.message };
    }
    
    return { user: null, session: null, error: 'Registration failed. Please try again.' };
  }
};

async function performRegistration(cleanUsername: string, password: string) {
  console.log('Checking if user exists...');
  
  // Check if user already exists in database
  const { data: existingUser, error: checkError } = await supabase
    .from('custom_users')
    .select('username')
    .eq('username', cleanUsername)
    .maybeSingle();
  
  if (checkError) {
    console.error('Error checking existing user:', checkError);
    throw new Error('Registration failed: Database error during user check');
  }
  
  if (existingUser) {
    console.log('Username already exists');
    throw new Error('Username already exists');
  }
  
  // Generate proper UUID for new user
  const newUserId = generateUUID();
  
  console.log('Creating user with ID:', newUserId);
  
  // Use Supabase transaction-like behavior with error handling
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
    
    // Step 2: Create/update balance using UPSERT to handle duplicates
    console.log('Creating/updating balance...');
    const { error: balanceError } = await supabase
      .from('user_balance')
      .upsert({
        user_id: dbUser.id,
        balance: 5
      }, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      });
    
    if (balanceError) {
      console.error('Balance creation failed:', balanceError);
      // Don't fail registration for balance issues, but log it
      console.warn('Continuing registration despite balance error');
    } else {
      console.log('Balance created/updated successfully');
    }
    
    // Step 3: Create welcome transaction using UPSERT
    console.log('Creating welcome transaction...');
    const { error: transactionError } = await supabase
      .from('transactions')
      .upsert({
        user_id: dbUser.id,
        amount: 5,
        description: 'Welcome bonus',
        type: 'admin'
      }, {
        onConflict: 'id',
        ignoreDuplicates: true
      });
    
    if (transactionError) {
      console.error('Transaction creation failed:', transactionError);
      // Don't fail registration for transaction issues
      console.warn('Continuing registration despite transaction error');
    } else {
      console.log('Welcome transaction created successfully');
    }
    
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
    console.error('Database operation failed:', dbError);
    
    // Clean up any partial data
    if (newUserId) {
      try {
        await supabase.from('custom_users').delete().eq('id', newUserId);
        await supabase.from('user_balance').delete().eq('user_id', newUserId);
        await supabase.from('transactions').delete().eq('user_id', newUserId);
      } catch (cleanupError) {
        console.warn('Cleanup failed:', cleanupError);
      }
    }
    
    throw dbError;
  }
}
