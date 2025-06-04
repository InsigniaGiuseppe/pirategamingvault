
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { login, logout } from '@/services/customAuthService';
import { registerUser } from '@/services/registrationService';
import { getUserBalance, getUserTransactions, getUserUnlockedGames, updateUserBalance } from '@/services/userService';
import type { CustomUser, CustomSession } from '@/services/customAuthService';

interface AuthState {
  isAuthenticated: boolean;
  user: CustomUser | null;
  session: CustomSession | null;
  isLoading: boolean;
  error: string | null;
  pirateCoins: number;
  transactions: any[];
  unlockedGames: string[];
}

interface AuthActions {
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  addPirateCoins: (amount: number, description?: string) => Promise<void>;
  unlockGame: (gameId: string, cost: number) => Promise<boolean>;
  checkIfGameUnlocked: (gameId: string) => boolean;
  refreshUserData: () => Promise<void>;
}

type AuthContextType = AuthState & AuthActions;

const AuthContext = createContext<AuthContextType | null>(null);

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  session: null,
  isLoading: false,
  error: null,
  pirateCoins: 0,
  transactions: [],
  unlockedGames: []
};

export const SimpleAuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>(initialState);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load user data from database
  const loadUserData = useCallback(async (userId: string) => {
    try {
      console.log('Loading user data from database for:', userId);
      
      const [balance, transactions, unlockedGames] = await Promise.all([
        getUserBalance(userId),
        getUserTransactions(userId),
        getUserUnlockedGames(userId)
      ]);
      
      console.log('User data loaded:', { balance, transactions: transactions.length, unlockedGames: unlockedGames.length });
      
      setState(prev => ({
        ...prev,
        pirateCoins: balance,
        transactions,
        unlockedGames
      }));
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, []);

  // Simple auth check on mount
  useEffect(() => {
    console.log('Starting auth check...');
    
    const checkAuth = async () => {
      try {
        const userStr = localStorage.getItem('pirate_user');
        const sessionStr = localStorage.getItem('pirate_session');
        
        if (userStr && sessionStr) {
          const storedUser = JSON.parse(userStr);
          const storedSession = JSON.parse(sessionStr);
          
          console.log('Found stored session:', { user: storedUser.username, expires: storedSession.expires_at });
          
          // Simple expiry check
          if (storedSession.expires_at && storedSession.expires_at * 1000 > Date.now()) {
            console.log('Valid session found, user authenticated');
            setState(prev => ({
              ...prev,
              isAuthenticated: true,
              user: storedUser,
              session: storedSession
            }));
            
            // Load user data from database
            await loadUserData(storedUser.id);
            return;
          } else {
            console.log('Session expired, clearing');
            localStorage.removeItem('pirate_user');
            localStorage.removeItem('pirate_session');
          }
        }
        
        console.log('No valid session, user not authenticated');
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('pirate_user');
        localStorage.removeItem('pirate_session');
      }
    };

    checkAuth();
  }, [loadUserData]);

  const handleLogin = useCallback(async (username: string, password: string) => {
    try {
      console.log('Starting login for:', username);
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { user, session, error } = await login(username, password);
      
      if (error || !user || !session) {
        console.error('Login failed:', error);
        setState(prev => ({ ...prev, isLoading: false, error: error || 'Login failed' }));
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: error || 'Login failed'
        });
        return;
      }
      
      console.log('Login successful, updating state');
      
      // Update state
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        user,
        session,
        error: null,
        isLoading: false
      }));
      
      // Load user data from database
      await loadUserData(user.id);
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.username}!`
      });
      
      // Navigate after a short delay
      setTimeout(() => {
        console.log('Navigating to dashboard...');
        navigate('/dashboard');
      }, 100);
      
    } catch (error) {
      console.error('Login error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      }));
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error instanceof Error ? error.message : 'Login failed'
      });
    }
  }, [toast, navigate, loadUserData]);

  const handleRegister = useCallback(async (username: string, password: string) => {
    try {
      console.log('Starting registration for:', username);
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { user, session, error } = await registerUser(username, password);
      
      if (error || !user) {
        console.error('Registration failed:', error);
        setState(prev => ({ ...prev, isLoading: false, error: error || 'Registration failed' }));
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: error || 'Registration failed'
        });
        return;
      }
      
      console.log('Registration successful, updating state');
      
      // Update state
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        user: {
          id: user.id,
          username: user.username || username,
          email: user.email || ''
        },
        session,
        error: null,
        isLoading: false
      }));
      
      // Load user data from database (should include welcome bonus)
      await loadUserData(user.id);
      
      toast({
        title: "Registration Successful",
        description: "Welcome to Pirate Gaming!"
      });
      
      // Navigate after a short delay
      setTimeout(() => {
        console.log('Navigating to dashboard...');
        navigate('/dashboard');
      }, 100);
      
    } catch (error) {
      console.error('Registration error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Registration failed' 
      }));
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error instanceof Error ? error.message : 'Registration failed'
      });
    }
  }, [toast, navigate, loadUserData]);

  const handleLogout = useCallback(async () => {
    try {
      console.log('Starting logout process');
      await logout();
      
      localStorage.removeItem('pirate_user');
      localStorage.removeItem('pirate_session');
      
      setState(initialState);
      navigate('/');
      console.log('Logout completed');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [navigate]);

  const addPirateCoins = useCallback(async (amount: number, description?: string) => {
    if (!state.user?.id) return;
    
    try {
      const success = await updateUserBalance(
        state.user.id, 
        amount, 
        description || 'Coins added', 
        'earn'
      );
      
      if (success) {
        // Refresh user data to get updated balance and transactions
        await loadUserData(state.user.id);
      }
    } catch (error) {
      console.error('Error adding pirate coins:', error);
    }
  }, [state.user?.id, loadUserData]);

  const unlockGame = useCallback(async (gameId: string, cost: number): Promise<boolean> => {
    if (!state.user?.id || state.pirateCoins < cost) return false;
    
    try {
      // Deduct coins
      const success = await updateUserBalance(
        state.user.id, 
        -cost, 
        `Unlocked game: ${gameId}`, 
        'spend'
      );
      
      if (success) {
        // Add to unlocked games (you might want to create a service for this)
        // For now, just refresh user data
        await loadUserData(state.user.id);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error unlocking game:', error);
      return false;
    }
  }, [state.user?.id, state.pirateCoins, loadUserData]);

  const checkIfGameUnlocked = useCallback((gameId: string): boolean => {
    return state.unlockedGames.includes(gameId);
  }, [state.unlockedGames]);

  const refreshUserData = useCallback(async () => {
    if (state.user?.id) {
      await loadUserData(state.user.id);
    }
  }, [state.user?.id, loadUserData]);

  const contextValue: AuthContextType = {
    ...state,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    addPirateCoins,
    unlockGame,
    checkIfGameUnlocked,
    refreshUserData
  };

  console.log('Auth context state:', { 
    isAuthenticated: state.isAuthenticated, 
    isLoading: state.isLoading,
    user: state.user?.username,
    hasError: !!state.error,
    pirateCoins: state.pirateCoins
  });

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useSimpleAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
};
