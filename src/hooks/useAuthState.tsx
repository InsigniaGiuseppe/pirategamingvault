
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
    let hasRunCheck = false;
    
    const checkAuth = async () => {
      // Prevent multiple simultaneous auth checks
      if (hasRunCheck || !isMounted) return;
      hasRunCheck = true;
      
      try {
        console.log('Starting auth check...');
        setState(prev => ({ ...prev, isLoading: true }));
        
        // Check local storage first for quick authentication
        const storedUser = localStorage.getItem('pirate_user');
        const storedSession = localStorage.getItem('pirate_session');
        
        if (storedUser && storedSession) {
          console.log('Found stored session, validating...');
          const user = JSON.parse(storedUser);
          const session = JSON.parse(storedSession);
          
          // Check if session is still valid (with some buffer time)
          if (session.expires_at * 1000 > Date.now() + 60000) { // 1 minute buffer
            console.log('Valid stored session found');
            
            if (!isMounted) return;
            
            setState(prev => ({
              ...prev,
              isAuthenticated: true,
              currentUser: user.username,
              userId: user.id,
              user: user,
              session: session,
              isLoading: false
            }));
            
            // Fetch additional data in background
            fetchUserData(user.id).then((data) => {
              if (isMounted) {
                setState(prev => ({
                  ...prev,
                  pirateCoins: data.balance,
                  transactions: data.userTransactions,
                  unlockedGames: data.userUnlockedGames,
                }));
              }
            }).catch(error => {
              console.error('Error loading user data:', error);
            });
            
            return;
          } else {
            console.log('Stored session expired, clearing...');
            localStorage.removeItem('pirate_user');
            localStorage.removeItem('pirate_session');
          }
        }
        
        console.log('No valid stored session, setting unauthenticated state');
        
        if (!isMounted) return;
        
        setState({
          ...initialAuthState,
          isLoading: false,
        });
        
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
    
    // Small delay to prevent race conditions
    const timeoutId = setTimeout(checkAuth, 100);
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [fetchUserData]);
  
  return { state, setState };
};
