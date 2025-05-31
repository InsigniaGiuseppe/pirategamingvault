
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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
  isLoading: true,
  error: null,
  pirateCoins: 100, // Default mock balance
  transactions: [
    {
      id: 'welcome-1',
      timestamp: Date.now(),
      amount: 100,
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

  // Force loading to complete after maximum timeout
  useEffect(() => {
    console.log('Setting up auth timeout fallback...');
    const timeoutId = setTimeout(() => {
      console.log('Auth timeout reached, forcing loading to complete');
      setState(prev => {
        if (prev.isLoading) {
          console.log('Forcing loading state to false due to timeout');
          return { ...prev, isLoading: false };
        }
        return prev;
      });
    }, 5000); // 5 second maximum timeout

    return () => clearTimeout(timeoutId);
  }, []);

  // Initialize auth state with comprehensive error handling
  useEffect(() => {
    let isMounted = true;
    let initializationCompleted = false;

    const initializeAuth = async () => {
      try {
        console.log('Starting auth initialization...');
        
        // Ensure we complete initialization within reasonable time
        const initTimeout = setTimeout(() => {
          if (!initializationCompleted && isMounted) {
            console.log('Auth initialization timeout, setting default state');
            setState(prev => ({ ...prev, isLoading: false }));
            initializationCompleted = true;
          }
        }, 3000);

        // Check for stored session with error handling
        let storedUser = null;
        let storedSession = null;
        
        try {
          const userStr = localStorage.getItem('pirate_user');
          const sessionStr = localStorage.getItem('pirate_session');
          
          if (userStr && sessionStr) {
            storedUser = JSON.parse(userStr);
            storedSession = JSON.parse(sessionStr);
            console.log('Found stored auth data');
          }
        } catch (error) {
          console.error('Error parsing stored auth data:', error);
          // Clear corrupted data
          try {
            localStorage.removeItem('pirate_user');
            localStorage.removeItem('pirate_session');
          } catch (e) {
            console.error('Error clearing localStorage:', e);
          }
        }
        
        if (storedUser && storedSession) {
          // Validate session expiry with error handling
          try {
            if (storedSession.expires_at && storedSession.expires_at * 1000 > Date.now()) {
              console.log('Valid stored session found, user authenticated');
              
              if (isMounted && !initializationCompleted) {
                setState(prev => ({
                  ...prev,
                  isAuthenticated: true,
                  user: storedUser,
                  session: storedSession,
                  isLoading: false
                }));
                initializationCompleted = true;
              }
              clearTimeout(initTimeout);
              return;
            } else {
              console.log('Stored session expired, clearing');
              try {
                localStorage.removeItem('pirate_user');
                localStorage.removeItem('pirate_session');
              } catch (e) {
                console.error('Error clearing expired session:', e);
              }
            }
          } catch (error) {
            console.error('Error validating session:', error);
          }
        }
        
        console.log('No valid stored session, user not authenticated');
        
        if (isMounted && !initializationCompleted) {
          setState(prev => ({ ...prev, isLoading: false }));
          initializationCompleted = true;
        }
        
        clearTimeout(initTimeout);
      } catch (error) {
        console.error('Critical error during auth initialization:', error);
        
        if (isMounted && !initializationCompleted) {
          setState(prev => ({ 
            ...prev, 
            isLoading: false, 
            error: 'Authentication initialization failed' 
          }));
          initializationCompleted = true;
        }
      }
    };

    // Small delay to prevent race conditions, then initialize
    const startTimeout = setTimeout(initializeAuth, 100);

    return () => {
      isMounted = false;
      clearTimeout(startTimeout);
      console.log('Auth initialization cleanup completed');
    };
  }, []);

  const handleLogin = async (username: string, password: string) => {
    if (isProcessing) {
      console.log('Login already in progress, skipping');
      return;
    }
    
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
  };

  const handleRegister = async (username: string, password: string) => {
    if (isProcessing) {
      console.log('Registration already in progress, skipping');
      return;
    }
    
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
          username: user.user_metadata?.username || username,
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
  };

  const handleLogout = async () => {
    try {
      console.log('Starting logout process');
      await logout();
      
      try {
        localStorage.removeItem('pirate_user');
        localStorage.removeItem('pirate_session');
      } catch (error) {
        console.error('Error clearing localStorage during logout:', error);
      }
      
      setState(initialState);
      navigate('/');
      console.log('Logout completed');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const addPirateCoins = (amount: number, description?: string) => {
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
  };

  const unlockGame = async (gameId: string, cost: number): Promise<boolean> => {
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
  };

  const checkIfGameUnlocked = (gameId: string): boolean => {
    return state.unlockedGames.includes(gameId);
  };

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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a SimpleAuthProvider');
  }
  return context;
};
