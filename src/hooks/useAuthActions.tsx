
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { verifyCredentials } from '@/services/authService';
import { registerUser } from '@/services/registrationService';
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
  
  const login = async (username: string, password: string) => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      
      // Check credentials against Supabase
      const credential = await verifyCredentials(username, password);
      
      if (credential) {
        localStorage.setItem('pirateLoggedIn', 'true');
        localStorage.setItem('pirateUsername', username);
        
        // Get user's balance from Supabase
        const balance = await getUserBalance(username);
        
        // Get user transactions
        const userTransactions = await getUserTransactions(username);
        
        // Get unlocked games
        const userUnlockedGames = await getUserUnlockedGames(username);
        
        if (setState) {
          setState({
            isAuthenticated: true,
            currentUser: username,
            pirateCoins: balance,
            transactions: userTransactions,
            unlockedGames: userUnlockedGames,
            isLoading: false
          });
        }
        
        navigate('/dashboard');
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Invalid or disabled credentials. Try again or join Discord."
        });
      }
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
  
  return { login, isProcessing };
};

// Create a hook for registration-related actions
export const useAuthRegistration = () => {
  const { toast } = useToast();
  const { login } = useAuthLogin();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  const register = async (username: string, password: string) => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      console.log('Attempting to register user:', username);
      
      // Register user with Supabase
      const { credential, error } = await registerUser(username, password);
      
      if (error) {
        console.error('Registration error from service:', error);
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: error
        });
        return;
      }
      
      if (!credential) {
        console.error('No credential returned from registerUser');
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: "An unknown error occurred. Please try again."
        });
        return;
      }

      console.log('Registration successful, proceeding to login');
      // Auto login after registration
      await login(username, password);
      
      toast({
        title: "Registration Successful",
        description: "Welcome to Pirate Gaming!"
      });
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
  
  const logout = () => {
    localStorage.removeItem('pirateLoggedIn');
    // We won't remove the other items so they persist between sessions
    if (setState) {
      setState(prev => ({
        ...prev,
        isAuthenticated: false,
        currentUser: null,
        pirateCoins: 0
      }));
    }
    navigate('/');
  };
  
  return { logout };
};

// Create a hook for coin management
export const useCoinsManagement = () => {
  const context = useContext(AuthStateContext);
  const { currentUser, pirateCoins } = context;
  
  const setState = 'setState' in context ? context.setState : undefined;
  
  const addPirateCoins = async (amount: number, description: string = '') => {
    if (!currentUser) return;
    
    const transactionType: 'earn' | 'spend' | 'admin' = 
      amount > 0 
        ? (description.includes('admin') ? 'admin' : 'earn') 
        : 'spend';
    
    // Update balance in Supabase
    const success = await updateUserBalance(currentUser, amount, description, transactionType);
    
    if (success && setState) {
      // Update local state
      const newTotal = Math.max(0, pirateCoins + amount);
      
      // Get updated transactions list
      const updatedTransactions = await getUserTransactions(currentUser);
      
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
export const useGameUnlocking = () => {
  const { toast } = useToast();
  const context = useContext(AuthStateContext);
  const { currentUser, pirateCoins, unlockedGames } = context;
  
  const setState = 'setState' in context ? context.setState : undefined;
  
  const handleUnlockGame = async (gameId: string, cost: number) => {
    if (!currentUser) return false;
    
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
    const success = await unlockGame(gameId, currentUser, cost);
    
    if (success && setState) {
      // Update local coin state
      // Get updated transactions list
      const updatedTransactions = await getUserTransactions(currentUser);
      
      // Get updated unlocked games list
      const updatedGames = await getUserUnlockedGames(currentUser);
      
      // Get updated balance
      const newBalance = await getUserBalance(currentUser);
      
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
  
  const isProcessing = isLoginProcessing || isRegistrationProcessing;
  
  return {
    login,
    register,
    logout,
    addPirateCoins,
    unlockGame,
    checkIfGameUnlocked,
    isProcessing
  };
};
