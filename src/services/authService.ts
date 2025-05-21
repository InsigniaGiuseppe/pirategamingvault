
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
