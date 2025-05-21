
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
  user: null,
  error: null
};

export const AuthStateContext = createContext<{
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
  setState: React.Dispatch<React.SetStateAction<AuthContextState>>;
} | AuthContextState>(initialAuthState);

export const useAuthState = () => {
  const context = useContext(AuthStateContext);
  if (!context) {
    throw new Error('useAuthState must be used within an AuthProvider');
  }
  return context;
};

// Enhanced hook for loading the initial auth state with optimized data fetching
export const useLoadAuthState = () => {
  const [state, setState] = useState<AuthContextState>(initialAuthState);
  
  // Create memoized data fetching function to prevent unnecessary re-renders
  const fetchUserData = useCallback(async (userId: string) => {
    try {
      // Use Promise.all to fetch data in parallel for better performance
      const [balance, userTransactions, userUnlockedGames] = await Promise.all([
        getUserBalance(userId),
        getUserTransactions(userId),
        getUserUnlockedGames(userId),
      ]);
      
      return { balance, userTransactions, userUnlockedGames };
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  }, []);
  
  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      if (!isMounted) return;
      
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        // Verify session with timeout to prevent long-hanging requests
        const authPromise = verifySession();
        const timeoutPromise = new Promise<{user: null, session: null, error: string}>((_, reject) => {
          setTimeout(() => reject(new Error('Auth verification timeout')), 5000);
        });
        
        const result = await Promise.race([
          authPromise,
          timeoutPromise
        ]);
        
        if (!isMounted) return;
        
        const { user, session, error } = result;
        
        if (error || !user || !session) {
          setState({
            ...initialAuthState,
            isLoading: false,
            error: error || 'Authentication failed',
          });
          return;
        }
        
        const userId = user.id;
        
        try {
          // Fetch user data in parallel for better performance
          const { balance, userTransactions, userUnlockedGames } = await fetchUserData(userId);
          
          if (!isMounted) return;
          
          setState({
            isAuthenticated: true,
            currentUser: user.username,
            userId: userId,
            pirateCoins: balance,
            transactions: userTransactions,
            unlockedGames: userUnlockedGames,
            isLoading: false,
            session: session,
            user: user,
            error: null
          });
        } catch (error) {
          console.error('Error loading user data:', error);
          
          if (!isMounted) return;
          
          setState(prev => ({ 
            ...prev, 
            isLoading: false,
            isAuthenticated: true,
            currentUser: user.username,
            userId: userId,
            session: session,
            user: user,
            error: 'Failed to load user data'
          }));
        }
      } catch (error) {
        console.error('Error during authentication check:', error);
        
        if (!isMounted) return;
        
        setState({
          ...initialAuthState,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Authentication error',
        });
      }
    };
    
    checkAuth();
    
    // Set up a refresh interval to periodically check session validity
    const refreshInterval = setInterval(() => {
      // Only refresh if the user is authenticated
      if (state.isAuthenticated) {
        checkAuth();
      }
    }, 15 * 60 * 1000); // Refresh every 15 minutes
    
    return () => {
      isMounted = false;
      clearInterval(refreshInterval);
    };
  }, [fetchUserData]);
  
  return { state, setState };
};
