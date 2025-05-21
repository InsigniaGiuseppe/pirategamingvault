import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { login, logout, registerUser } from '@/services/customAuthService';
import { updateUserBalance, getUserTransactions, getUserUnlockedGames, getUserBalance } from '@/services/userService';
import { unlockGame } from '@/services/gameService';
import { AuthStateContext } from './useAuthState';
import { useContext, useState } from 'react';

// Create a hook for authentication-related actions
export const useAuthLogin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const context = useContext(AuthStateContext);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  const setState = 'setState' in context ? context.setState : undefined;
  
  const handleLogin = async (username: string, password: string) => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      
      // Sign in with custom auth
      const { user, session, error } = await login(username, password);
      
      if (error || !session || !user) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: error || "Invalid credentials. Try again or join Discord."
        });
        return;
      }
      
      // Get user data
      const balance = await getUserBalance(user.id);
      const userTransactions = await getUserTransactions(user.id);
      const userUnlockedGames = await getUserUnlockedGames(user.id);
      
      // Update state with user data
      if (setState) {
        setState({
          isAuthenticated: true,
          currentUser: user.username,
          userId: user.id,
          pirateCoins: balance,
          transactions: userTransactions,
          unlockedGames: userUnlockedGames,
          isLoading: false,
          session: session,
          user: user
        });
      }
      
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "Login Error",
        description: "An error occurred during login. Please try again."
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return { login: handleLogin, isProcessing };
};

// Create a hook for registration-related actions
export const useAuthRegistration = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const context = useContext(AuthStateContext);
  
  const setState = 'setState' in context ? context.setState : undefined;
  
  const register = async (username: string, password: string) => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      console.log('Attempting to register user:', username);
      
      // Register user with custom auth
      const { user, session, error } = await registerUser(username, password);
      
      if (error) {
        console.error('Registration error from service:', error);
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: error
        });
        return;
      }
      
      if (!user || !session) {
        console.error('No user or session returned from registerUser');
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: "An unknown error occurred. Please try again."
        });
        return;
      }

      console.log('Registration successful, proceeding to dashboard');
      
      // Update state with user data
      if (setState) {
        setState({
          isAuthenticated: true,
          currentUser: user.username,
          userId: user.id,
          pirateCoins: 10, // Initial balance from registration
          transactions: [{ // Initial welcome transaction
            id: 'welcome',
            timestamp: Date.now(),
            amount: 10,
            description: 'Welcome bonus',
            type: 'admin'
          }],
          unlockedGames: [],
          isLoading: false,
          session: session,
          user: user
        });
      }
      
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
        description: "An error occurred during registration. Please try again."
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return { register, isProcessing };
};

// Create a hook for session management
export const useAuthSession = () => {
  const navigate = useNavigate();
  const context = useContext(AuthStateContext);
  
  const setState = 'setState' in context ? context.setState : undefined;
  
  const handleLogout = async () => {
    const { error } = await logout();
    
    if (error) {
      console.error('Error signing out:', error);
    }
    
    if (setState) {
      setState({
        ...context,
        isAuthenticated: false,
        currentUser: null,
        userId: null,
        session: null,
        user: null
      });
    }
    
    navigate('/');
  };
  
  return { logout: handleLogout };
};

// Create a hook for coin management
const useCoinsManagement = () => {
  const context = useContext(AuthStateContext);
  const { userId, pirateCoins } = context;
  
  const setState = 'setState' in context ? context.setState : undefined;
  
  const addPirateCoins = async (amount: number, description: string = '') => {
    if (!userId) return;
    
    const transactionType: 'earn' | 'spend' | 'admin' = 
      amount > 0 
        ? (description.includes('admin') ? 'admin' : 'earn') 
        : 'spend';
    
    // Update balance in Supabase
    const success = await updateUserBalance(userId, amount, description, transactionType);
    
    if (success && setState) {
      // Update local state
      const newTotal = Math.max(0, pirateCoins + amount);
      
      // Get updated transactions list
      const updatedTransactions = await getUserTransactions(userId);
      
      setState(prev => ({
        ...prev,
        pirateCoins: newTotal,
        transactions: updatedTransactions
      }));
    }
  };
  
  return { addPirateCoins };
};

// Create a hook for game unlocking
const useGameUnlocking = () => {
  const { toast } = useToast();
  const context = useContext(AuthStateContext);
  const { userId, pirateCoins, unlockedGames } = context;
  
  const setState = 'setState' in context ? context.setState : undefined;
  
  const handleUnlockGame = async (gameId: string, cost: number) => {
    if (!userId) return false;
    
    // Check if user has enough coins
    if (pirateCoins < cost) {
      toast({
        variant: "destructive",
        title: "Not Enough Coins",
        description: `You need ${cost - pirateCoins} more coins to unlock this game.`
      });
      return false;
    }
    
    // Unlock game with Supabase
    const success = await unlockGame(gameId, userId, cost);
    
    if (success && setState) {
      // Update local coin state
      // Get updated transactions list
      const updatedTransactions = await getUserTransactions(userId);
      
      // Get updated unlocked games list
      const updatedGames = await getUserUnlockedGames(userId);
      
      // Get updated balance
      const newBalance = await getUserBalance(userId);
      
      setState(prev => ({
        ...prev,
        pirateCoins: newBalance,
        transactions: updatedTransactions,
        unlockedGames: updatedGames
      }));
      
      return true;
    }
    
    return false;
  };
  
  const checkIfGameUnlocked = (gameId: string) => {
    return unlockedGames.includes(gameId);
  };
  
  return { unlockGame: handleUnlockGame, checkIfGameUnlocked };
};

// Combine all hooks into a single useAuthActions hook
export const useAuthActions = () => {
  const { login, isProcessing: isLoginProcessing } = useAuthLogin();
  const { register, isProcessing: isRegistrationProcessing } = useAuthRegistration();
  const { logout } = useAuthSession();
  const { addPirateCoins } = useCoinsManagement();
  const { unlockGame, checkIfGameUnlocked } = useGameUnlocking();
  const navigate = useNavigate();
  
  const isProcessing = isLoginProcessing || isRegistrationProcessing;
  
  return {
    login,
    register,
    logout,
    addPirateCoins,
    unlockGame,
    checkIfGameUnlocked,
    isProcessing,
    navigate
  };
};
