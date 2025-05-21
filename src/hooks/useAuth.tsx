
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
  unlockGame: (gameId: string, cost: number) => void;
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
  
  // Wrap the AuthStateContext around our useAuthActions hook
  const WrappedAuthActions = () => {
    const actions = useAuthActions();
    return actions;
  };
  
  const { 
    login, 
    register, 
    logout, 
    addPirateCoins, 
    unlockGame: handleUnlockGame,
    checkIfGameUnlocked,
    isProcessing
  } = WrappedAuthActions();

  const contextValue: AuthContextType = {
    isAuthenticated: state.isAuthenticated,
    currentUser: state.currentUser,
    pirateCoins: state.pirateCoins,
    transactions: state.transactions,
    unlockedGames: state.unlockedGames,
    isLoading: state.isLoading || isProcessing,
    login,
    register,
    logout,
    addPirateCoins,
    unlockGame: handleUnlockGame,
    checkIfGameUnlocked
  };

  return (
    <AuthStateContext.Provider value={{ ...state, setState }}>
      <AuthContext.Provider value={contextValue}>
        {children}
      </AuthContext.Provider>
    </AuthStateContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
