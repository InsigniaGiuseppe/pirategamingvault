
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { login } from '@/services/customAuthService';
import { getUserBalance, getUserTransactions, getUserUnlockedGames } from '@/services/userService';
import { AuthStateContext } from './useAuthState';

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
          user: user,
          error: null // Adding the missing error property
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
