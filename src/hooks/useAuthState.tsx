
import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { verifySession } from '@/services/customAuthService';
import { getUserBalance, getUserTransactions, getUserUnlockedGames } from '@/services/userService';
import type { CustomUser, CustomSession } from '@/services/customAuthService';

interface AuthContextState {
  isAuthenticated: boolean;
  currentUser: string | null;
  userId: string | null;
  pirateCoins: number;
  transactions: Transaction[];
  unlockedGames: string[];
  isLoading: boolean;
  session: CustomSession | null;
  user: CustomUser | null;
  error: string | null;
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
  isLoading: true,
  session: null,
  user: null,
  error: null
};

// Create context with setState function
export const AuthStateContext = createContext<AuthContextState & {
  setState?: React.Dispatch<React.SetStateAction<AuthContextState>>
}>(initialAuthState);

export const useAuthState = () => {
  const context = useContext(AuthStateContext);
  if (!context) {
    throw new Error('useAuthState must be used within an AuthProvider');
  }
  return context;
};

// Emergency fix: Completely local auth state loading with cache-busting
export const useLoadAuthState = () => {
  const [state, setState] = useState<AuthContextState>(initialAuthState);
  
  // Create memoized data fetching function for mock data
  const fetchUserData = useCallback(async (userId: string) => {
    try {
      console.log('Fetching mock user data for:', userId);
      
      // All data is now mock and returns immediately
      const balance = 5; // Updated to 5 coins starter balance
      const userTransactions = [
        {
          id: 'welcome-1',
          timestamp: Date.now(),
          amount: 5, // Updated to 5 coins
          description: 'Welcome bonus',
          type: 'admin' as const
        }
      ];
      const userUnlockedGames: string[] = [];
      
      console.log('Mock user data loaded instantly');
      return { balance, userTransactions, userUnlockedGames };
    } catch (error) {
      console.error('Error with mock data:', error);
      throw error;
    }
  }, []);
  
  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      if (!isMounted) return;
      
      try {
        console.log('Emergency auth check - completely local only...');
        setState(prev => ({ ...prev, isLoading: true }));
        
        // Clear any potential Supabase cache
        sessionStorage.clear();
        
        // Check local storage only - no external calls
        const storedUser = localStorage.getItem('pirate_user');
        const storedSession = localStorage.getItem('pirate_session');
        
        if (storedUser && storedSession) {
          console.log('Found local session, validating...');
          const user = JSON.parse(storedUser);
          const session = JSON.parse(storedSession);
          
          // Check if session is still valid
          if (session.expires_at * 1000 > Date.now() + 60000) {
            console.log('Valid local session confirmed');
            
            if (!isMounted) return;
            
            // Set authenticated state immediately
            setState(prev => ({
              ...prev,
              isAuthenticated: true,
              currentUser: user.username,
              userId: user.id,
              user: user,
              session: session,
              isLoading: false,
              pirateCoins: 5, // Updated to 5 coins starter balance
              transactions: [
                {
                  id: 'welcome-1',
                  timestamp: Date.now(),
                  amount: 5, // Updated to 5 coins
                  description: 'Welcome bonus',
                  type: 'admin'
                }
              ],
              unlockedGames: []
            }));
            
            console.log('Auth state set - user is authenticated');
            return;
          } else {
            console.log('Local session expired, clearing...');
            localStorage.removeItem('pirate_user');
            localStorage.removeItem('pirate_session');
          }
        }
        
        console.log('No valid local session, setting unauthenticated');
        
        if (!isMounted) return;
        
        setState({
          ...initialAuthState,
          isLoading: false,
        });
        
      } catch (error) {
        console.error('Error during local auth check:', error);
        
        if (!isMounted) return;
        
        setState({
          ...initialAuthState,
          isLoading: false,
          error: 'Auth check failed',
        });
      }
    };
    
    // Run immediately - no delays
    checkAuth();
    
    return () => {
      isMounted = false;
    };
  }, []);
  
  return { state, setState };
};
