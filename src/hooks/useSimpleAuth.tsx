
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { login, logout } from '@/services/customAuthService';
import { registerUser } from '@/services/registrationService';
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
  addPirateCoins: (amount: number, description?: string) => void;
  unlockGame: (gameId: string, cost: number) => Promise<boolean>;
  checkIfGameUnlocked: (gameId: string) => boolean;
}

type AuthContextType = AuthState & AuthActions;

const AuthContext = createContext<AuthContextType | null>(null);

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  session: null,
  isLoading: false, // Start with false to prevent blocking
  error: null,
  pirateCoins: 10,
  transactions: [
    {
      id: 'welcome-1',
      timestamp: Date.now(),
      amount: 10,
      description: 'Welcome bonus',
      type: 'admin'
    }
  ],
  unlockedGames: []
};

export const SimpleAuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>(initialState);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Simple, synchronous auth check on mount
  useEffect(() => {
    console.log('Starting simplified auth check...');
    
    try {
      const userStr = localStorage.getItem('pirate_user');
      const sessionStr = localStorage.getItem('pirate_session');
      
      if (userStr && sessionStr) {
        const storedUser = JSON.parse(userStr);
        const storedSession = JSON.parse(sessionStr);
        
        // Simple expiry check
        if (storedSession.expires_at && storedSession.expires_at * 1000 > Date.now()) {
          console.log('Valid session found, user authenticated');
          setState(prev => ({
            ...prev,
            isAuthenticated: true,
            user: storedUser,
            session: storedSession
          }));
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
      // Clear corrupted data
      localStorage.removeItem('pirate_user');
      localStorage.removeItem('pirate_session');
    }
  }, []);

  const handleLogin = useCallback(async (username: string, password: string) => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      console.log('Starting login for:', username);
      
      const { user, session, error } = await login(username, password);
      
      if (error || !user || !session) {
        throw new Error(error || 'Login failed');
      }
      
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        user,
        session,
        error: null
      }));
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.username}!`
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error instanceof Error ? error.message : 'Login failed'
      });
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, navigate, toast]);

  const handleRegister = useCallback(async (username: string, password: string) => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      console.log('Starting registration for:', username);
      
      const { user, session, error } = await registerUser(username, password);
      
      if (error || !user) {
        throw new Error(error || 'Registration failed');
      }
      
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        user: {
          id: user.id,
          username: user.username || username,
          email: user.email || ''
        },
        session,
        error: null
      }));
      
      toast({
        title: "Registration Successful",
        description: "Welcome to Pirate Gaming!"
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error instanceof Error ? error.message : 'Registration failed'
      });
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, navigate, toast]);

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

  const addPirateCoins = useCallback((amount: number, description?: string) => {
    setState(prev => ({
      ...prev,
      pirateCoins: prev.pirateCoins + amount,
      transactions: [
        {
          id: Date.now().toString(),
          timestamp: Date.now(),
          amount,
          description: description || 'Coins added',
          type: 'earn'
        },
        ...prev.transactions
      ]
    }));
  }, []);

  const unlockGame = useCallback(async (gameId: string, cost: number): Promise<boolean> => {
    if (state.pirateCoins < cost) return false;
    
    setState(prev => ({
      ...prev,
      pirateCoins: prev.pirateCoins - cost,
      unlockedGames: [...prev.unlockedGames, gameId],
      transactions: [
        {
          id: Date.now().toString(),
          timestamp: Date.now(),
          amount: -cost,
          description: `Unlocked game: ${gameId}`,
          type: 'spend'
        },
        ...prev.transactions
      ]
    }));
    
    return true;
  }, [state.pirateCoins]);

  const checkIfGameUnlocked = useCallback((gameId: string): boolean => {
    return state.unlockedGames.includes(gameId);
  }, [state.unlockedGames]);

  const contextValue: AuthContextType = {
    ...state,
    isLoading: state.isLoading || isProcessing,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    addPirateCoins,
    unlockGame,
    checkIfGameUnlocked
  };

  console.log('Auth context state:', { 
    isAuthenticated: state.isAuthenticated, 
    isLoading: state.isLoading || isProcessing,
    user: state.user?.username,
    hasError: !!state.error
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
