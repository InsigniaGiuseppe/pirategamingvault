
import { createContext, useContext, ReactNode } from 'react';
import { useAuthState, useLoadAuthState, AuthStateContext, initialAuthState } from './useAuthState';
import { useAuthActions } from './useAuthActions';

interface AuthProviderProps {
  children: ReactNode;
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => void;
  logout: () => void;
  register: (username: string, password: string) => void;
  currentUser?: string | null;
  pirateCoins: number;
  addPirateCoins: (amount: number, description?: string) => void;
  transactions: Transaction[];
  unlockedGames: string[];
  unlockGame: (gameId: string, cost: number) => Promise<boolean>;
  checkIfGameUnlocked: (gameId: string) => boolean;
  isLoading: boolean;
}

interface Transaction {
  id: string;
  timestamp: number;
  amount: number;
  description: string;
  type: 'earn' | 'spend' | 'admin';
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { state, setState } = useLoadAuthState();
  
  // Create a combined state context provider value that includes the setState function
  const authStateWithSetter = {
    ...state,
    setState
  };
  
  // Provide the AuthStateContext around the useAuthActions hook
  const AuthActionsProvider = () => {
    return (
      <AuthStateContext.Provider value={authStateWithSetter}>
        <AuthActionsConsumer />
      </AuthStateContext.Provider>
    );
  };
  
  // Use a consumer component to access the context and create the actions
  const AuthActionsConsumer = () => {
    const actions = useAuthActions();
    
    const contextValue: AuthContextType = {
      isAuthenticated: state.isAuthenticated,
      currentUser: state.currentUser,
      pirateCoins: state.pirateCoins,
      transactions: state.transactions,
      unlockedGames: state.unlockedGames,
      isLoading: state.isLoading || actions.isProcessing,
      ...actions
    };
    
    return (
      <AuthContext.Provider value={contextValue}>
        {children}
      </AuthContext.Provider>
    );
  };
  
  return <AuthActionsProvider />;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
