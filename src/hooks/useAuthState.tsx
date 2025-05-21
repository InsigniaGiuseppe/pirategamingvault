
import { useState, useEffect, createContext, useContext } from 'react';
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
  session: CustomSession | null;
  user: CustomUser | null;
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
    const checkAuth = async () => {
      setState(prev => ({ ...prev, isLoading: true }));
      
      try {
        // Verify session
        const { user, session, error } = await verifySession();
        
        if (error || !user || !session) {
          setState({
            ...initialAuthState,
            isLoading: false,
          });
          return;
        }
        
        const userId = user.id;
        
        try {
          // Get balance
          const balance = await getUserBalance(userId);
          
          // Get transactions
          const userTransactions = await getUserTransactions(userId);
          
          // Get unlocked games
          const userUnlockedGames = await getUserUnlockedGames(userId);
          
          setState({
            isAuthenticated: true,
            currentUser: user.username,
            userId: userId,
            pirateCoins: balance,
            transactions: userTransactions,
            unlockedGames: userUnlockedGames,
            isLoading: false,
            session: session,
            user: user
          });
        } catch (error) {
          console.error('Error loading user data:', error);
          setState(prev => ({ 
            ...prev, 
            isLoading: false,
            isAuthenticated: true,
            currentUser: user.username,
            userId: userId,
            session: session,
            user: user
          }));
        }
      } catch (error) {
        console.error('Error during authentication check:', error);
        setState({
          ...initialAuthState,
          isLoading: false,
        });
      }
    };
    
    checkAuth();
  }, []);
  
  return { state, setState };
};
