
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getUserBalance, getUserTransactions, getUserUnlockedGames } from '@/services/userService';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextState {
  isAuthenticated: boolean;
  currentUser: string | null;
  userId: string | null;
  pirateCoins: number;
  transactions: Transaction[];
  unlockedGames: string[];
  isLoading: boolean;
  session: Session | null;
  user: User | null;
  setState?: React.Dispatch<React.SetStateAction<AuthContextState>>;
}

interface Transaction {
  id: string;
  timestamp: number;
  amount: number;
  description: string;
  type: 'earn' | 'spend' | 'admin';
}

export const initialAuthState: AuthContextState = {
  isAuthenticated: false,
  currentUser: null,
  userId: null,
  pirateCoins: 0,
  transactions: [],
  unlockedGames: [],
  isLoading: false,
  session: null,
  user: null
};

export const AuthStateContext = createContext<{
  isAuthenticated: boolean;
  currentUser: string | null;
  userId: string | null;
  pirateCoins: number;
  transactions: Transaction[];
  unlockedGames: string[];
  isLoading: boolean;
  session: Session | null;
  user: User | null;
  setState: React.Dispatch<React.SetStateAction<AuthContextState>>;
} | AuthContextState>(initialAuthState);

export const useAuthState = () => {
  const context = useContext(AuthStateContext);
  if (!context) {
    throw new Error('useAuthState must be used within an AuthProvider');
  }
  return context;
};

// Hook for loading the initial auth state
export const useLoadAuthState = () => {
  const [state, setState] = useState<AuthContextState>(initialAuthState);
  
  useEffect(() => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (session && session.user) {
          const email = session.user.email;
          const userId = session.user.id;
          
          // Use setTimeout to prevent possible deadlocks with Supabase client
          setTimeout(async () => {
            try {
              // Get username from profile
              const { data: profile } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', userId)
                .single();
              
              // Get balance
              const balance = await getUserBalance(userId);
              
              // Get transactions
              const userTransactions = await getUserTransactions(userId);
              
              // Get unlocked games
              const userUnlockedGames = await getUserUnlockedGames(userId);
              
              setState({
                isAuthenticated: true,
                currentUser: profile?.username || email || null,
                userId: userId,
                pirateCoins: balance,
                transactions: userTransactions,
                unlockedGames: userUnlockedGames,
                isLoading: false,
                session: session,
                user: session.user
              });
            } catch (error) {
              console.error('Error loading user data:', error);
              setState(prev => ({ 
                ...prev, 
                isLoading: false,
                isAuthenticated: false,
                session: null,
                user: null
              }));
            }
          }, 0);
        } else {
          setState({
            ...initialAuthState,
            isLoading: false,
          });
        }
      }
    );
    
    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && session.user) {
        // Don't load data here, onAuthStateChange above will handle it
        setState(prev => ({ 
          ...prev,
          isAuthenticated: true,
          session: session,
          user: session.user
        }));
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  return { state, setState };
};
