
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

// Get user role
export const getUserRole = async (userId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();
    
    if (error || !data) {
      return null;
    }
    
    return data.role || 'user';
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

// Helper to check if user is admin
export const isUserAdmin = async (userId: string): Promise<boolean> => {
  const role = await getUserRole(userId);
  return role === 'admin';
};
