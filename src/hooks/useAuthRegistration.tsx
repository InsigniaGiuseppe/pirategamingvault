
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { registerUser } from '@/services/registrationService';
import { AuthStateContext } from './useAuthState';
import { getUserBalance, getUserTransactions } from '@/services/userService';

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
      
      try {
        // Fetch user data that was created by the trigger
        const balance = await getUserBalance(user.id);
        const transactions = await getUserTransactions(user.id);
        
        // Update state with user data
        if (setState) {
          setState({
            isAuthenticated: true,
            currentUser: user.user_metadata?.username || username,
            userId: user.id,
            pirateCoins: balance,
            transactions: transactions, 
            unlockedGames: [],
            isLoading: false,
            session: session,
            user: {
              id: user.id,
              username: user.user_metadata?.username || username,
              email: user.email || ''
            },
            error: null
          });
        }
        
        toast({
          title: "Registration Successful",
          description: "Welcome to Pirate Gaming!"
        });
        
        navigate('/dashboard');
      } catch (dataError) {
        console.error('Error fetching initial user data:', dataError);
        
        // Even if we can't get full user data, registration was successful
        if (setState) {
          setState({
            isAuthenticated: true,
            currentUser: user.user_metadata?.username || username,
            userId: user.id,
            pirateCoins: 10, // Default value
            transactions: [],
            unlockedGames: [],
            isLoading: false,
            session: session,
            user: {
              id: user.id,
              username: user.user_metadata?.username || username,
              email: user.email || ''
            },
            error: null
          });
        }
        
        toast({
          title: "Registration Successful",
          description: "Welcome to Pirate Gaming!"
        });
        
        navigate('/dashboard');
      }
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
