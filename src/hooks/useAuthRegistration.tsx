
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { registerUser } from '@/services/registrationService';
import { AuthStateContext } from './useAuthState';

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
          currentUser: user.user_metadata.username || user.email?.split('@')[0] || 'User',
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
          user: {
            id: user.id,
            username: user.user_metadata.username || user.email?.split('@')[0] || 'User',
            email: user.email || ''
          },
          error: null // Adding the missing error property
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
