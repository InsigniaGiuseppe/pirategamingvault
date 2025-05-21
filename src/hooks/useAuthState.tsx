
import { useState, useEffect, createContext, useContext } from 'react';
import { verifyCredentials, registerUser, getUserBalance, getUserTransactions, getUserUnlockedGames } from '@/services/userService';

interface AuthContextState {
  isAuthenticated: boolean;
  currentUser: string | null;
  pirateCoins: number;
  transactions: Transaction[];
  unlockedGames: string[];
  isLoading: boolean;
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
  pirateCoins: 0,
  transactions: [],
  unlockedGames: [],
  isLoading: false
};

export const AuthStateContext = createContext<AuthContextState>(initialAuthState);

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
    // Check if user is logged in from localStorage
    const loggedIn = localStorage.getItem('pirateLoggedIn') === 'true';
    const username = localStorage.getItem('pirateUsername');
    
    if (loggedIn && username) {
      // Load user's data from Supabase
      const loadUserData = async () => {
        try {
          setState(prev => ({ ...prev, isLoading: true }));
          
          // Get balance
          const balance = await getUserBalance(username);
          
          // Get transactions
          const userTransactions = await getUserTransactions(username);
          
          // Get unlocked games
          const userUnlockedGames = await getUserUnlockedGames(username);
          
          setState({
            isAuthenticated: true,
            currentUser: username,
            pirateCoins: balance,
            transactions: userTransactions,
            unlockedGames: userUnlockedGames,
            isLoading: false
          });
        } catch (error) {
          console.error('Error loading user data:', error);
          setState(prev => ({ ...prev, isLoading: false }));
        }
      };
      
      loadUserData();
    }
  }, []);
  
  return { state, setState };
};
