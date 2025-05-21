
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
  isLoading: true, // Start as loading to prevent flashes of unauthenticated state
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

// Enhanced hook for loading the initial auth state with optimized data fetching
export const useLoadAuthState = () => {
  const [state, setState] = useState<AuthContextState>(initialAuthState);
  
  // Create memoized data fetching function to prevent unnecessary re-renders
  const fetchUserData = useCallback(async (userId: string) => {
    try {
      console.log('Fetching user data for:', userId);
      // Use Promise.all to fetch data in parallel for better performance
      const [balance, userTransactions, userUnlockedGames] = await Promise.all([
        getUserBalance(userId),
        getUserTransactions(userId),
        getUserUnlockedGames(userId),
      ]);
      
      console.log('User data fetched successfully:', { 
        balance, 
        transactions: userTransactions.length,
        games: userUnlockedGames.length 
      });
      
      return { balance, userTransactions, userUnlockedGames };
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  }, []);
  
  useEffect(() => {
    let isMounted = true;
    let authCheckTimeout: number | null = null;
    
    const checkAuth = async () => {
      if (!isMounted) return;
      
      try {
        // Check local storage first for faster loading
        const storedUser = localStorage.getItem('pirate_user');
        const storedSession = localStorage.getItem('pirate_session');
        
        if (storedUser && storedSession) {
          console.log('Found stored session, using it for initial state');
          const user = JSON.parse(storedUser);
          const session = JSON.parse(storedSession);
          
          // Check if session is still valid
          if (session.expires_at * 1000 > Date.now()) {
            // Update state with stored data first
            setState(prev => ({
              ...prev,
              isAuthenticated: true,
              currentUser: user.username,
              userId: user.id,
              user: user,
              session: session,
              isLoading: true // Still loading additional data
            }));
            
            // Fetch additional user data in the background
            try {
              const { balance, userTransactions, userUnlockedGames } = await fetchUserData(user.id);
              
              if (isMounted) {
                setState(prev => ({
                  ...prev,
                  pirateCoins: balance,
                  transactions: userTransactions,
                  unlockedGames: userUnlockedGames,
                  isLoading: false
                }));
              }
            } catch (error) {
              console.error('Error loading additional user data:', error);
              if (isMounted) {
                setState(prev => ({
                  ...prev,
                  isLoading: false,
                  error: 'Could not load all user data'
                }));
              }
            }
            
            return; // We're done here, no need for further verification
          }
        }
        
        // If no valid stored session, proceed with server verification
        console.log('No valid stored session, verifying with server');
        setState(prev => ({ ...prev, isLoading: true }));
        
        // Create a timeout promise to prevent hanging
        const timeoutPromise = new Promise<{user: null, session: null, error: string}>((_, reject) => {
          authCheckTimeout = window.setTimeout(() => {
            reject(new Error('Auth verification timeout'));
          }, 5000) as unknown as number;
        });
        
        // Race between the actual auth check and the timeout
        const result = await Promise.race([
          verifySession(),
          timeoutPromise
        ]).catch(err => {
          console.error('Auth verification error:', err);
          return {user: null, session: null, error: err.message};
        });
        
        // Clear the timeout as we got a response
        if (authCheckTimeout) {
          window.clearTimeout(authCheckTimeout);
          authCheckTimeout = null;
        }
        
        if (!isMounted) return;
        
        const { user, session, error } = result;
        
        if (error || !user || !session) {
          console.log('Not authenticated user, clearing state');
          // Not an authenticated user, but loading is complete
          setState({
            ...initialAuthState,
            isLoading: false,
            error: error,
          });
          return;
        }
        
        console.log('Authentication verified for:', user.username);
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
          
          console.log('Auth state fully initialized with user data');
        } catch (error) {
          console.error('Error loading user data:', error);
          
          if (!isMounted) return;
          
          // Still authenticate the user even if we can't load all their data
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
          
          console.log('Auth state initialized with partial data');
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
    
    // Set up interval to periodically check authentication status
    const authRefreshInterval = window.setInterval(() => {
      // Recheck auth every 5 minutes to ensure sessions are kept alive
      if (isMounted) {
        console.log('Periodic session refresh check');
        checkAuth();
      }
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => {
      isMounted = false;
      if (authCheckTimeout) {
        window.clearTimeout(authCheckTimeout);
      }
      window.clearInterval(authRefreshInterval);
    };
  }, [fetchUserData]);
  
  return { state, setState };
};
