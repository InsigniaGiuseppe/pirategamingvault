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
  isLoading: false,
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

  // Navigation guard with timeout
  const navigateWithGuard = useCallback((path: string, maxWaitTime = 3000) => {
    console.log(`Attempting navigation to ${path} with ${maxWaitTime}ms timeout`);
    
    const startTime = Date.now();
    const attemptNavigation = () => {
      const elapsed = Date.now() - startTime;
      
      if (elapsed >= maxWaitTime) {
        console.warn('Navigation timeout reached, forcing navigation');
        navigate(path);
        return;
      }
      
      // Check if auth state is ready
      if (state.isAuthenticated && state.user && !isProcessing) {
        console.log('Auth state ready, navigating');
        navigate(path);
      } else {
        console.log('Auth state not ready, retrying in 100ms');
        setTimeout(attemptNavigation, 100);
      }
    };
    
    attemptNavigation();
  }, [navigate, state.isAuthenticated, state.user, isProcessing]);

  const handleLogin = useCallback(async (username: string, password: string) => {
    if (isProcessing) {
      console.log('Login already in progress, skipping');
      return;
    }
    
    let timeoutId: NodeJS.Timeout;
    
    try {
      setIsProcessing(true);
      console.log('Starting login for:', username);
      
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Set a timeout to prevent infinite loading
      timeoutId = setTimeout(() => {
        console.error('Login timeout reached');
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: 'Login timeout - please try again' 
        }));
        setIsProcessing(false);
        toast({
          variant: "destructive",
          title: "Login Timeout",
          description: "Login took too long. Please try again."
        });
      }, 15000); // 15 second timeout
      
      const { user, session, error } = await login(username, password);
      
      // Clear timeout since we got a response
      clearTimeout(timeoutId);
      
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
      
      console.log('Login successful, updating auth state');
      
      // Update state synchronously first
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        user,
        session,
        error: null,
        isLoading: false
      }));
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.username}!`
      });
      
      // Navigate with guard after state update
      console.log('Login complete, navigating to dashboard');
      setTimeout(() => {
        navigateWithGuard('/dashboard');
      }, 100);
      
    } catch (error) {
      clearTimeout(timeoutId!);
      console.error('Login error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Login failed' 
      }));
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error instanceof Error ? error.message : 'Login failed'
      });
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, toast, navigateWithGuard]);

  const handleRegister = useCallback(async (username: string, password: string) => {
    if (isProcessing) {
      console.log('Registration already in progress, skipping');
      return;
    }
    
    let timeoutId: NodeJS.Timeout;
    
    try {
      setIsProcessing(true);
      console.log('Starting registration for:', username);
      
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Set a timeout to prevent infinite loading
      timeoutId = setTimeout(() => {
        console.error('Registration timeout reached');
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: 'Registration timeout - please try again' 
        }));
        setIsProcessing(false);
        toast({
          variant: "destructive",
          title: "Registration Timeout",
          description: "Registration took too long. Please try again."
        });
      }, 20000); // 20 second timeout for registration
      
      const { user, session, error } = await registerUser(username, password);
      
      // Clear timeout since we got a response
      clearTimeout(timeoutId);
      
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
      
      console.log('Registration successful, updating auth state');
      
      // Update state synchronously first
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
      
      toast({
        title: "Registration Successful",
        description: "Welcome to Pirate Gaming!"
      });
      
      // Navigate with guard after state update
      console.log('Registration complete, navigating to dashboard');
      setTimeout(() => {
        navigateWithGuard('/dashboard');
      }, 100);
      
    } catch (error) {
      clearTimeout(timeoutId!);
      console.error('Registration error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Registration failed' 
      }));
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error instanceof Error ? error.message : 'Registration failed'
      });
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, toast, navigateWithGuard]);

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
    hasError: !!state.error,
    isProcessing
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
