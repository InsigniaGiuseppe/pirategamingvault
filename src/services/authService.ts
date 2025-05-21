import { supabase } from "@/integrations/supabase/client";
import { CustomUser, CustomSession } from "./customAuthService";

// Get current user info from Supabase
export const getCurrentUser = async (): Promise<CustomUser | null> => {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error || !data.user) {
      return null;
    }
    
    return {
      id: data.user.id,
      username: data.user.user_metadata.username || data.user.email?.split('@')[0] || 'User',
      email: data.user.email
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Check if session is valid
export const isSessionValid = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error || !data.session) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking session validity:', error);
    return false;
  }
};

// Get user role - this checks if a 'role' column exists, 
// and returns a default value if it doesn't
export const getUserRole = async (userId: string): Promise<string | null> => {
  try {
    // First check if 'role' column exists in profiles table
    const { data: columnInfo, error: columnError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (columnError || !columnInfo || columnInfo.length === 0) {
      console.warn('Could not check profiles table schema:', columnError);
      return 'user'; // Default to 'user' role if we can't check
    }
    
    // If the first row doesn't have a 'role' property, assume it doesn't exist
    const firstRow = columnInfo[0];
    const roleExists = firstRow && 'role' in firstRow;
    
    if (!roleExists) {
      console.warn('Role column does not exist in profiles table');
      return 'user'; // Default to 'user' role
    }
    
    // If role column exists, proceed with original query
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      console.warn('Error getting user role:', error);
      return 'user'; // Default to 'user' role
    }
    
    // Explicitly check if data is null before proceeding
    if (data === null) {
      return 'user'; // Default to 'user' role if no data
    }
    
    // Check if data is a record with a role property before accessing it
    // Using a type guard to ensure TypeScript understands what we're doing
    const hasRole = typeof data === 'object' && 'role' in data;
    return hasRole ? (data.role as string) || 'user' : 'user';
  } catch (error) {
    console.error('Error getting user role:', error);
    return 'user'; // Default to 'user' role
  }
};

// Helper to check if user is admin
export const isUserAdmin = async (userId: string): Promise<boolean> => {
  const role = await getUserRole(userId);
  return role === 'admin';
};
