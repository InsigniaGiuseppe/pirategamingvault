
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
      console.log('Login process starting for:', username);
      setIsProcessing(true);
      
      // Sign in with custom auth
      const { user, session, error } = await login(username, password);
      
      if (error || !session || !user) {
        console.error('Login failed:', error);
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: error || "Invalid credentials. Try again or join Discord."
        });
        setIsProcessing(false);
        return;
      }
      
      console.log('Login successful, fetching user data');
      
      try {
        // Get user data
        const balance = await getUserBalance(user.id);
        const userTransactions = await getUserTransactions(user.id);
        const userUnlockedGames = await getUserUnlockedGames(user.id);
        
        console.log('User data fetched successfully:', {
          balance,
          transactionsCount: userTransactions.length,
          unlockedGames: userUnlockedGames.length
        });
        
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
            error: null
          });
        }
        
        setIsProcessing(false);
        
        // Success toast
        toast({
          title: "Login Successful",
          description: `Welcome back, ${user.username}!`,
        });
        
        navigate('/dashboard');
      } catch (dataError) {
        console.error('Error fetching user data:', dataError);
        
        // Even if we can't get full user data, login was successful
        // Update state with minimal information and redirect
        if (setState) {
          setState({
            isAuthenticated: true,
            currentUser: user.username,
            userId: user.id,
            pirateCoins: 0, // default value
            transactions: [],
            unlockedGames: [],
            isLoading: false,
            session: session,
            user: user,
            error: null
          });
        }
        
        toast({
          title: "Login Successful",
          description: "Signed in, but had trouble loading your data. Some features may be limited."
        });
        
        setIsProcessing(false);
        navigate('/dashboard');
      }
      
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "Login Error",
        description: "An error occurred during login. Please try again."
      });
      setIsProcessing(false);
    }
  };
  
  return { login: handleLogin, isProcessing };
};
