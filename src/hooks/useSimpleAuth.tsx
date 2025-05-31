
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

  // Initialize auth state once on mount
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth state...');
        
        // Check for stored session
        const storedUser = localStorage.getItem('pirate_user');
        const storedSession = localStorage.getItem('pirate_session');
        
        if (storedUser && storedSession) {
          const user = JSON.parse(storedUser);
          const session = JSON.parse(storedSession);
          
          // Check if session is still valid
          if (session.expires_at * 1000 > Date.now()) {
            console.log('Valid stored session found');
            
            if (isMounted) {
              setState(prev => ({
                ...prev,
                isAuthenticated: true,
                user,
                session,
                isLoading: false
              }));
            }
            return;
          } else {
            console.log('Stored session expired');
            localStorage.removeItem('pirate_user');
            localStorage.removeItem('pirate_session');
          }
        }
        
        if (isMounted) {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (isMounted) {
          setState(prev => ({ 
            ...prev, 
            isLoading: false, 
            error: 'Failed to initialize authentication' 
          }));
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogin = async (username: string, password: string) => {
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
  };

  const handleRegister = async (username: string, password: string) => {
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
      await logout();
      localStorage.removeItem('pirate_user');
      localStorage.removeItem('pirate_session');
      
      setState(initialState);
      navigate('/');
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
