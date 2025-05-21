
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { signInWithEmail, signOut } from '@/services/authService';
import { registerUser } from '@/services/registrationService';
import { updateUserBalance, getUserTransactions, getUserUnlockedGames, getUserBalance } from '@/services/userService';
import { unlockGame } from '@/services/gameService';
import { AuthStateContext } from './useAuthState';
import { useContext, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Create a hook for authentication-related actions
export const useAuthLogin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const context = useContext(AuthStateContext);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  const setState = 'setState' in context ? context.setState : undefined;
  
  const login = async (email: string, password: string) => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      
      // Sign in with Supabase Auth
      const { session, user, error } = await signInWithEmail(email, password);
      
      if (error || !session || !user) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: error || "Invalid credentials. Try again or join Discord."
        });
        return;
      }
      
      // If login successful, onAuthStateChange in useAuthState will update the state
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
  
  return { login, isProcessing };
};

// Create a hook for registration-related actions
export const useAuthRegistration = () => {
  const { toast } = useToast();
  const { login } = useAuthLogin();
  const navigate = useNavigate();  // Add the navigate function here
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  const register = async (username: string, password: string) => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      console.log('Attempting to register user:', username);
      
      // Register user with Supabase Auth
      const { user, error } = await registerUser(username, password);
      
      if (error) {
        console.error('Registration error from service:', error);
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: error
        });
        return;
      }
      
      if (!user) {
        console.error('No user returned from registerUser');
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: "An unknown error occurred. Please try again."
        });
        return;
      }

      console.log('Registration successful, proceeding to login');
      // Auto login after registration - the login will be handled by onAuthStateChange
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
  
  const logout = async () => {
    const { error } = await signOut();
    
    if (error) {
      console.error('Error signing out:', error);
    }
    
    navigate('/');
  };
  
  return { logout };
};

// Create a hook for coin management
export const useCoinsManagement = () => {
  const context = useContext(AuthStateContext);
  const { currentUser, userId, pirateCoins } = context;
  
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
export const useGameUnlocking = () => {
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
  const navigate = useNavigate(); // Make sure navigate is available at this level too
  
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
