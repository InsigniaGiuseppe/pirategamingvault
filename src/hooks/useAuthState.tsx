
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

// Simplified auth state loading to prevent loops
export const useLoadAuthState = () => {
  const [state, setState] = useState<AuthContextState>(initialAuthState);
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  
  // Create memoized data fetching function
  const fetchUserData = useCallback(async (userId: string) => {
    try {
      console.log('Fetching user data for:', userId);
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
    
    // Prevent multiple auth checks
    if (authCheckComplete) return;
    
    const checkAuth = async () => {
      if (!isMounted) return;
      
      try {
        console.log('Starting auth check...');
        setState(prev => ({ ...prev, isLoading: true }));
        
        // Check local storage first
        const storedUser = localStorage.getItem('pirate_user');
        const storedSession = localStorage.getItem('pirate_session');
        
        if (storedUser && storedSession) {
          console.log('Found stored session, validating...');
          const user = JSON.parse(storedUser);
          const session = JSON.parse(storedSession);
          
          // Check if session is still valid
          if (session.expires_at * 1000 > Date.now()) {
            console.log('Valid stored session found');
            
            setState(prev => ({
              ...prev,
              isAuthenticated: true,
              currentUser: user.username,
              userId: user.id,
              user: user,
              session: session,
              isLoading: true
            }));
            
            // Fetch additional data
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
              console.error('Error loading user data:', error);
              if (isMounted) {
                setState(prev => ({
                  ...prev,
                  isLoading: false
                }));
              }
            }
            
            setAuthCheckComplete(true);
            return;
          } else {
            console.log('Stored session expired, clearing...');
            localStorage.removeItem('pirate_user');
            localStorage.removeItem('pirate_session');
          }
        }
        
        // No valid stored session, check with server
        console.log('Checking server session...');
        const { user, session, error } = await verifySession();
        
        if (!isMounted) return;
        
        if (error || !user || !session) {
          console.log('No valid session found');
          setState({
            ...initialAuthState,
            isLoading: false,
          });
          setAuthCheckComplete(true);
          return;
        }
        
        console.log('Valid server session found for:', user.username);
        
        // Fetch user data
        try {
          const { balance, userTransactions, userUnlockedGames } = await fetchUserData(user.id);
          
          if (!isMounted) return;
          
          setState({
            isAuthenticated: true,
            currentUser: user.username,
            userId: user.id,
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
            userId: user.id,
            session: session,
            user: user,
          }));
        }
        
        setAuthCheckComplete(true);
      } catch (error) {
        console.error('Error during authentication check:', error);
        
        if (!isMounted) return;
        
        setState({
          ...initialAuthState,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Authentication error',
        });
        setAuthCheckComplete(true);
      }
    };
    
    checkAuth();
    
    return () => {
      isMounted = false;
    };
  }, [fetchUserData, authCheckComplete]);
  
  return { state, setState };
};
