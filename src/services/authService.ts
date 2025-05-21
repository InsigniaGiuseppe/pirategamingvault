
import { supabase } from "@/integrations/supabase/client";
import { Credential } from "./credentialService";

// Verify user credentials
export const verifyCredentials = async (username: string, password: string): Promise<Credential | null> => {
  try {
    console.log('Verifying credentials for:', username);
    const { data, error } = await supabase
      .from('credentials')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .eq('active', true)
      .single();
    
    if (error) {
      console.error('Error verifying credentials:', error);
      return null;
    }
    
    if (!data) {
      console.log('No matching credentials found');
      return null;
    }
    
    console.log('Credentials verified successfully');
    return {
      id: data.id,
      username: data.username,
      password: data.password,
      authCode: data.auth_code,
      active: data.active,
      createdAt: data.created_at
    };
  } catch (error) {
    console.error('Unexpected error during verification:', error);
    return null;
  }
};

// Register a new user
export const registerUser = async (username: string, password: string, authCode: string = '010101!'): Promise<{credential: Credential | null, error: string | null}> => {
  try {
    console.log('Starting registration for:', username);
    
    // First check if the username already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('credentials')
      .select('username')
      .eq('username', username)
      .single();
    
    if (existingUser) {
      console.log('Username already exists:', existingUser);
      return { credential: null, error: 'Username already exists' };
    }
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows found, which is what we want
      console.error('Error checking existing user:', checkError);
      return { credential: null, error: 'Error checking if username exists' };
    }
    
    console.log('Username is available, proceeding with registration');
    
    // Insert the user credentials with RLS access
    const { data: credentialData, error: credentialError } = await supabase
      .from('credentials')
      .insert({
        username,
        password, 
        auth_code: authCode,
        active: true
      })
      .select()
      .single();
    
    if (credentialError) {
      console.error('Error registering user (credential insert):', credentialError);
      return { credential: null, error: 'Failed to create user account: ' + credentialError.message };
    }
    
    if (!credentialData) {
      console.error('No data returned from credential insert');
      return { credential: null, error: 'Failed to create user account: No data returned' };
    }
    
    console.log('Credentials created successfully, initializing user balance');
    
    // Initialize user balance with 10 coins
    const { error: balanceError } = await supabase
      .from('user_balance')
      .insert({
        user_id: username,
        balance: 10
      });
    
    if (balanceError) {
      console.error('Error initializing user balance:', balanceError);
      return { 
        credential: {
          id: credentialData.id,
          username: credentialData.username,
          password: credentialData.password,
          authCode: credentialData.auth_code,
          active: credentialData.active,
          createdAt: credentialData.created_at
        }, 
        error: 'Account created but failed to initialize balance: ' + balanceError.message 
      };
    }
    
    console.log('User balance initialized, creating welcome transaction');
    
    // Create initial welcome transaction
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: username,
        amount: 10,
        description: 'Welcome bonus',
        type: 'admin'
      });
    
    if (transactionError) {
      console.error('Error creating welcome transaction:', transactionError);
      // Continue despite transaction error since the account was created
    }
    
    console.log('Registration complete for:', username);
    
    // Format the response to match our existing Credential interface
    return { 
      credential: {
        id: credentialData.id,
        username: credentialData.username,
        password: credentialData.password,
        authCode: credentialData.auth_code,
        active: credentialData.active,
        createdAt: credentialData.created_at
      },
      error: null
    };
  } catch (error) {
    console.error('Unexpected error during registration:', error);
    // @ts-ignore
    return { credential: null, error: `Unexpected error during registration: ${error?.message || error}` };
  }
};
