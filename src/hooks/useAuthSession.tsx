
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '@/services/customAuthService';
import { AuthStateContext } from './useAuthState';

export const useAuthSession = () => {
  const navigate = useNavigate();
  const context = useContext(AuthStateContext);
  
  const setState = 'setState' in context ? context.setState : undefined;
  
  const handleLogout = async () => {
    try {
      await logout(); // logout() returns void, so no destructuring needed
      
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
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  return { logout: handleLogout };
};
