import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { login, logout } from '@/services/customAuthService';
import { registerUser } from '@/services/registrationService';
import { getUserBalance, getUserTransactions, getUserUnlockedGames, updateUserBalance } from '@/services/userService';
import { activityLogger } from '@/services/activityLoggingService';
import { useTimerManager } from '@/hooks/useTimerManager';
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
  const mountedRef = useRef(true);
  const operationQueueRef = useRef<Promise<any>>(Promise.resolve());
  const { setTimer, clearTimer, clearAllTimers } = useTimerManager();

  // Add comprehensive logging for debugging
  console.log('🔐 SimpleAuthProvider - Current state:', {
    isAuthenticated: state.isAuthenticated,
    userId: state.user?.id,
    pirateCoins: state.pirateCoins,
    transactionCount: state.transactions.length,
    unlockedGamesCount: state.unlockedGames.length,
    isLoading: state.isLoading,
    hasError: !!state.error
  });

  console.log('🔐 SimpleAuthProvider - Component render:', {
    mountedRef: mountedRef.current,
    operationQueueLength: 'active',
    timerManagerStatus: 'available'
  });

  useEffect(() => {
    return () => {
      console.log('🔐 SimpleAuthProvider - Cleanup triggered');
      mountedRef.current = false;
      clearAllTimers();
    };
  }, [clearAllTimers]);

  const safeSetState = useCallback((updater: (prev: AuthState) => AuthState) => {
    if (mountedRef.current) {
      console.log('🔐 SimpleAuthProvider - State update triggered');
      setState(updater);
    } else {
      console.warn('🔐 SimpleAuthProvider - Attempted state update after unmount');
    }
  }, []);

  // Queue operations to prevent race conditions
  const queueOperation = useCallback(async <T>(operation: () => Promise<T>): Promise<T> => {
    console.log('🔐 SimpleAuthProvider - Queueing operation');
    const currentQueue = operationQueueRef.current;
    const newOperation = currentQueue.then(operation).catch((error) => {
      console.error('🔐 SimpleAuthProvider - Queued operation failed:', error);
      throw error;
    });
    operationQueueRef.current = newOperation.catch(() => {}); // Don't let failures break the queue
    return newOperation;
  }, []);

  const loadUserData = useCallback(async (userId: string) => {
    if (!mountedRef.current) return;
    
    try {
      console.log('🔐 SimpleAuthProvider - Loading user data for:', userId);
      
      const [balance, transactions, unlockedGames] = await Promise.all([
        getUserBalance(userId),
        getUserTransactions(userId),
        getUserUnlockedGames(userId)
      ]);
      
      console.log('🔐 SimpleAuthProvider - User data loaded:', {
        balance,
        transactionCount: transactions.length,
        unlockedGamesCount: unlockedGames.length
      });
      
      if (!mountedRef.current) return;
      
      safeSetState(prev => ({
        ...prev,
        pirateCoins: balance,
        transactions,
        unlockedGames
      }));
    } catch (error) {
      console.error('🔐 SimpleAuthProvider - Error loading user data:', error);
    }
  }, [safeSetState]);

  useEffect(() => {
    console.log('🔐 SimpleAuthProvider - Starting auth check...');
    
    const checkAuth = async () => {
      if (!mountedRef.current) return;
      
      try {
        const userStr = localStorage.getItem('pirate_user');
        const sessionStr = localStorage.getItem('pirate_session');
        
        console.log('🔐 SimpleAuthProvider - Checking localStorage:', {
          hasUser: !!userStr,
          hasSession: !!sessionStr
        });
        
        if (userStr && sessionStr) {
          const storedUser = JSON.parse(userStr);
          const storedSession = JSON.parse(sessionStr);
          
          if (storedSession.expires_at && storedSession.expires_at * 1000 > Date.now()) {
            console.log('🔐 SimpleAuthProvider - Valid session found');
            
            if (!mountedRef.current) return;
            
            safeSetState(prev => ({
              ...prev,
              isAuthenticated: true,
              user: storedUser,
              session: storedSession
            }));
            
            await loadUserData(storedUser.id);
            return;
          } else {
            console.log('🔐 SimpleAuthProvider - Session expired');
            localStorage.removeItem('pirate_user');
            localStorage.removeItem('pirate_session');
          }
        }
        
        console.log('🔐 SimpleAuthProvider - No valid session found');
      } catch (error) {
        console.error('🔐 SimpleAuthProvider - Auth check error:', error);
        localStorage.removeItem('pirate_user');
        localStorage.removeItem('pirate_session');
      }
    };

    checkAuth();
  }, [loadUserData, safeSetState]);

  const handleLogin = useCallback(async (username: string, password: string) => {
    return queueOperation(async () => {
      if (!mountedRef.current) return;
      
      console.log('🔐 SimpleAuthProvider - Starting login for:', username);
      
      const timeoutId = setTimer('login-timeout', () => {
        if (mountedRef.current) {
          console.log('🔐 SimpleAuthProvider - Login timeout triggered');
          safeSetState(prev => ({ ...prev, isLoading: false, error: 'Login timed out' }));
        }
      }, 15000);
      
      try {
        safeSetState(prev => ({ ...prev, isLoading: true, error: null }));
        
        const { user, session, error } = await login(username, password);
        
        clearTimer('login-timeout');
        
        if (!mountedRef.current) return;
        
        if (error || !user || !session) {
          console.error('🔐 SimpleAuthProvider - Login failed:', error);
          safeSetState(prev => ({ 
            ...prev, 
            isLoading: false, 
            error: error || 'Login failed' 
          }));
          toast({
            variant: "destructive",
            title: "Login Failed",
            description: error || 'Invalid credentials'
          });
          return;
        }
        
        console.log('🔐 SimpleAuthProvider - Login successful');
        safeSetState(prev => ({
          ...prev,
          isAuthenticated: true,
          user,
          session,
          error: null,
          isLoading: false
        }));
        
        await loadUserData(user.id);
        
        try {
          await activityLogger.logLogin(user.id, user.username);
          console.log('🔐 SimpleAuthProvider - Login activity logged');
        } catch (activityError) {
          console.warn('🔐 SimpleAuthProvider - Failed to log login activity:', activityError);
        }
        
        toast({
          title: "Login Successful",
          description: `Welcome back, ${user.username}!`
        });
        
        setTimer('navigation-delay', () => {
          if (mountedRef.current) {
            navigate('/dashboard');
          }
        }, 100);
        
      } catch (error) {
        clearTimer('login-timeout');
        console.error('🔐 SimpleAuthProvider - Login error:', error);
        if (mountedRef.current) {
          safeSetState(prev => ({ 
            ...prev, 
            isLoading: false, 
            error: 'Login failed. Please try again.' 
          }));
          toast({
            variant: "destructive",
            title: "Login Failed",
            description: 'Login failed. Please try again.'
          });
        }
      }
    });
  }, [toast, navigate, loadUserData, safeSetState, setTimer, clearTimer, queueOperation]);

  const handleRegister = useCallback(async (username: string, password: string) => {
    return queueOperation(async () => {
      if (!mountedRef.current) return;
      
      console.log('🔐 SimpleAuthProvider - Starting registration for:', username);
      
      const timeoutId = setTimer('register-timeout', () => {
        if (mountedRef.current) {
          console.log('🔐 SimpleAuthProvider - Registration timeout triggered');
          safeSetState(prev => ({ ...prev, isLoading: false, error: 'Registration timed out' }));
        }
      }, 20000);
      
      try {
        safeSetState(prev => ({ ...prev, isLoading: true, error: null }));
        
        const { user, session, error } = await registerUser(username, password);
        
        clearTimer('register-timeout');
        
        if (!mountedRef.current) return;
        
        if (error || !user) {
          console.error('🔐 SimpleAuthProvider - Registration failed:', error);
          safeSetState(prev => ({ 
            ...prev, 
            isLoading: false, 
            error: error || 'Registration failed' 
          }));
          toast({
            variant: "destructive",
            title: "Registration Failed",
            description: error || 'Registration failed'
          });
          return;
        }
        
        console.log('🔐 SimpleAuthProvider - Registration successful');
        safeSetState(prev => ({
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
        
        await loadUserData(user.id);
        
        try {
          await activityLogger.logRegistration(user.id, user.username || username);
          console.log('🔐 SimpleAuthProvider - Registration activity logged');
        } catch (activityError) {
          console.warn('🔐 SimpleAuthProvider - Failed to log registration activity:', activityError);
        }
        
        toast({
          title: "Registration Successful",
          description: "Welcome to Pirate Gaming!"
        });
        
        setTimer('navigation-delay', () => {
          if (mountedRef.current) {
            navigate('/dashboard');
          }
        }, 100);
        
      } catch (error) {
        clearTimer('register-timeout');
        console.error('🔐 SimpleAuthProvider - Registration error:', error);
        if (mountedRef.current) {
          safeSetState(prev => ({ 
            ...prev, 
            isLoading: false, 
            error: 'Registration failed. Please try again.' 
          }));
          toast({
            variant: "destructive",
            title: "Registration Failed",
            description: 'Registration failed. Please try again.'
          });
        }
      }
    });
  }, [toast, navigate, loadUserData, safeSetState, setTimer, clearTimer, queueOperation]);

  const handleLogout = useCallback(async () => {
    return queueOperation(async () => {
      try {
        console.log('🔐 SimpleAuthProvider - Starting logout process');
        
        if (state.user?.id && state.user?.username) {
          try {
            await activityLogger.logLogout(state.user.id, state.user.username);
            console.log('🔐 SimpleAuthProvider - Logout activity logged');
          } catch (activityError) {
            console.warn('🔐 SimpleAuthProvider - Failed to log logout activity:', activityError);
          }
        }
        
        await logout();
        
        localStorage.removeItem('pirate_user');
        localStorage.removeItem('pirate_session');
        
        if (mountedRef.current) {
          safeSetState(() => initialState);
          navigate('/');
        }
        console.log('🔐 SimpleAuthProvider - Logout completed');
      } catch (error) {
        console.error('🔐 SimpleAuthProvider - Logout error:', error);
      }
    });
  }, [navigate, state.user, safeSetState, queueOperation]);

  const addPirateCoins = useCallback(async (amount: number, description?: string) => {
    if (!state.user?.id) {
      console.warn('🔐 SimpleAuthProvider - Cannot add coins: No user ID');
      return;
    }
    
    console.log('🔐 SimpleAuthProvider - Adding coins:', { amount, description, userId: state.user.id });
    
    try {
      const success = await updateUserBalance(
        state.user.id, 
        amount, 
        description || 'Coins added', 
        'earn'
      );
      
      console.log('🔐 SimpleAuthProvider - Add coins result:', success);
      
      if (success && mountedRef.current) {
        await loadUserData(state.user.id);
      }
    } catch (error) {
      console.error('🔐 SimpleAuthProvider - Error adding pirate coins:', error);
    }
  }, [state.user?.id, loadUserData]);

  const unlockGame = useCallback(async (gameId: string, cost: number): Promise<boolean> => {
    if (!state.user?.id || state.pirateCoins < cost) {
      console.warn('🔐 SimpleAuthProvider - Cannot unlock game:', {
        hasUserId: !!state.user?.id,
        currentCoins: state.pirateCoins,
        cost
      });
      return false;
    }
    
    console.log('🔐 SimpleAuthProvider - Unlocking game:', { gameId, cost, userId: state.user.id });
    
    try {
      const success = await updateUserBalance(
        state.user.id, 
        -cost, 
        `Unlocked game: ${gameId}`, 
        'spend'
      );
      
      console.log('🔐 SimpleAuthProvider - Game unlock result:', success);
      
      if (success && mountedRef.current) {
        try {
          await activityLogger.logGameUnlocked(state.user.id, gameId, gameId, cost);
          console.log('🔐 SimpleAuthProvider - Game unlock activity logged');
        } catch (activityError) {
          console.warn('🔐 SimpleAuthProvider - Failed to log game unlock activity:', activityError);
        }
        
        await loadUserData(state.user.id);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('🔐 SimpleAuthProvider - Error unlocking game:', error);
      return false;
    }
  }, [state.user?.id, state.pirateCoins, loadUserData]);

  const checkIfGameUnlocked = useCallback((gameId: string): boolean => {
    const isUnlocked = state.unlockedGames.includes(gameId);
    console.log('🔐 SimpleAuthProvider - Checking game unlock status:', { gameId, isUnlocked });
    return isUnlocked;
  }, [state.unlockedGames]);

  const refreshUserData = useCallback(async () => {
    console.log('🔐 SimpleAuthProvider - Refreshing user data');
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

export const SimpleAuthContext = AuthContext;
