
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { registerUser } from '@/services/registrationService';
import { activityLogger } from '@/services/activityLoggingService';
import type { AuthState } from './types';

export const useAuthRegister = (
  safeSetState: (updater: (prev: AuthState) => AuthState) => void,
  loadUserData: (userId: string) => Promise<void>,
  setTimer: (key: string, callback: () => void, delay: number) => void,
  clearTimer: (key: string) => void,
  queueOperation: <T>(operation: () => Promise<T>) => Promise<T>,
  mountedRef: React.MutableRefObject<boolean>
) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRegister = useCallback(async (username: string, password: string) => {
    return queueOperation(async () => {
      if (!mountedRef.current) return;
      
      console.log('🔐 Starting registration for:', username);
      
      const timeoutId = setTimer('register-timeout', () => {
        if (mountedRef.current) {
          console.log('🔐 Registration timeout triggered');
          safeSetState(prev => ({ ...prev, isLoading: false, error: 'Registration timed out' }));
        }
      }, 20000);
      
      try {
        safeSetState(prev => ({ ...prev, isLoading: true, error: null }));
        
        const { user, session, error } = await registerUser(username, password);
        
        clearTimer('register-timeout');
        
        if (!mountedRef.current) return;
        
        if (error || !user || !session) {
          console.error('🔐 Registration failed:', error);
          safeSetState(prev => ({ 
            ...prev, 
            isLoading: false, 
            error: error || 'Registration failed' 
          }));
          toast({
            variant: "destructive",
            title: "Registration Failed",
            description: error || 'Registration failed'
          });
          return;
        }
        
        console.log('🔐 Registration successful, auto-logging in...');
        
        // Store auth in localStorage for auto-login
        localStorage.setItem('pirate_user', JSON.stringify(user));
        localStorage.setItem('pirate_session', JSON.stringify(session));
        
        safeSetState(prev => ({
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
        
        await loadUserData(user.id);
        
        try {
          await activityLogger.logRegistration(user.id, user.username || username);
          console.log('🔐 Registration activity logged');
        } catch (activityError) {
          console.warn('🔐 Failed to log registration activity:', activityError);
        }
        
        toast({
          title: "Registration Successful",
          description: "Welcome to Pirate Gaming! You have been automatically logged in."
        });
        
        setTimer('navigation-delay', () => {
          if (mountedRef.current) {
            navigate('/dashboard');
          }
        }, 100);
        
      } catch (error) {
        clearTimer('register-timeout');
        console.error('🔐 Registration error:', error);
        if (mountedRef.current) {
          safeSetState(prev => ({ 
            ...prev, 
            isLoading: false, 
            error: 'Registration failed. Please try again.' 
          }));
          toast({
            variant: "destructive",
            title: "Registration Failed",
            description: 'Registration failed. Please try again.'
          });
        }
      }
    });
  }, [toast, navigate, loadUserData, safeSetState, setTimer, clearTimer, queueOperation, mountedRef]);

  return { handleRegister };
};
