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

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      clearAllTimers();
    };
  }, [clearAllTimers]);

  const safeSetState = useCallback((updater: (prev: AuthState) => AuthState) => {
    if (mountedRef.current) {
      setState(updater);
    }
  }, []);

  // Queue operations to prevent race conditions
  const queueOperation = useCallback(async <T>(operation: () => Promise<T>): Promise<T> => {
    const currentQueue = operationQueueRef.current;
    const newOperation = currentQueue.then(operation).catch((error) => {
      console.error('Queued operation failed:', error);
      throw error;
    });
    operationQueueRef.current = newOperation.catch(() => {}); // Don't let failures break the queue
    return newOperation;
  }, []);

  const loadUserData = useCallback(async (userId: string) => {
    if (!mountedRef.current) return;
    
    try {
      console.log('Loading user data for:', userId);
      
      const [balance, transactions, unlockedGames] = await Promise.all([
        getUserBalance(userId),
        getUserTransactions(userId),
        getUserUnlockedGames(userId)
      ]);
      
      if (!mountedRef.current) return;
      
      safeSetState(prev => ({
        ...prev,
        pirateCoins: balance,
        transactions,
        unlockedGames
      }));
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, [safeSetState]);

  useEffect(() => {
    console.log('Starting auth check...');
    
    const checkAuth = async () => {
      if (!mountedRef.current) return;
      
      try {
        const userStr = localStorage.getItem('pirate_user');
        const sessionStr = localStorage.getItem('pirate_session');
        
        if (userStr && sessionStr) {
          const storedUser = JSON.parse(userStr);
          const storedSession = JSON.parse(sessionStr);
          
          if (storedSession.expires_at && storedSession.expires_at * 1000 > Date.now()) {
            console.log('Valid session found');
            
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
            console.log('Session expired');
            localStorage.removeItem('pirate_user');
            localStorage.removeItem('pirate_session');
          }
        }
        
        console.log('No valid session found');
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('pirate_user');
        localStorage.removeItem('pirate_session');
      }
    };

    checkAuth();
  }, [loadUserData, safeSetState]);

  const handleLogin = useCallback(async (username: string, password: string) => {
    return queueOperation(async () => {
      if (!mountedRef.current) return;
      
      const timeoutId = setTimer('login-timeout', () => {
        if (mountedRef.current) {
          safeSetState(prev => ({ ...prev, isLoading: false, error: 'Login timed out' }));
        }
      }, 15000);
      
      try {
        console.log('Starting login for:', username);
        safeSetState(prev => ({ ...prev, isLoading: true, error: null }));
        
        const { user, session, error } = await login(username, password);
        
        clearTimer('login-timeout');
        
        if (!mountedRef.current) return;
        
        if (error || !user || !session) {
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
        } catch (activityError) {
          console.warn('Failed to log login activity:', activityError);
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
        console.error('Login error:', error);
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
      
      const timeoutId = setTimer('register-timeout', () => {
        if (mountedRef.current) {
          safeSetState(prev => ({ ...prev, isLoading: false, error: 'Registration timed out' }));
        }
      }, 20000);
      
      try {
        console.log('Starting registration for:', username);
        safeSetState(prev => ({ ...prev, isLoading: true, error: null }));
        
        const { user, session, error } = await registerUser(username, password);
        
        clearTimer('register-timeout');
        
        if (!mountedRef.current) return;
        
        if (error || !user) {
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
        } catch (activityError) {
          console.warn('Failed to log registration activity:', activityError);
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
        console.error('Registration error:', error);
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
        console.log('Starting logout process');
        
        if (state.user?.id && state.user?.username) {
          try {
            await activityLogger.logLogout(state.user.id, state.user.username);
          } catch (activityError) {
            console.warn('Failed to log logout activity:', activityError);
          }
        }
        
        await logout();
        
        localStorage.removeItem('pirate_user');
        localStorage.removeItem('pirate_session');
        
        if (mountedRef.current) {
          safeSetState(() => initialState);
          navigate('/');
        }
        console.log('Logout completed');
      } catch (error) {
        console.error('Logout error:', error);
      }
    });
  }, [navigate, state.user, safeSetState, queueOperation]);

  const addPirateCoins = useCallback(async (amount: number, description?: string) => {
    if (!state.user?.id) return;
    
    try {
      const success = await updateUserBalance(
        state.user.id, 
        amount, 
        description || 'Coins added', 
        'earn'
      );
      
      if (success && mountedRef.current) {
        await loadUserData(state.user.id);
      }
    } catch (error) {
      console.error('Error adding pirate coins:', error);
    }
  }, [state.user?.id, loadUserData]);

  const unlockGame = useCallback(async (gameId: string, cost: number): Promise<boolean> => {
    if (!state.user?.id || state.pirateCoins < cost) return false;
    
    try {
      const success = await updateUserBalance(
        state.user.id, 
        -cost, 
        `Unlocked game: ${gameId}`, 
        'spend'
      );
      
      if (success && mountedRef.current) {
        try {
          await activityLogger.logGameUnlocked(state.user.id, gameId, gameId, cost);
        } catch (activityError) {
          console.warn('Failed to log game unlock activity:', activityError);
        }
        
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
