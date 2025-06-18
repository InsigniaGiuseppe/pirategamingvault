
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { login } from '@/services/customAuthService';
import { activityLogger } from '@/services/activityLoggingService';
import type { AuthState } from './types';

export const useAuthLogin = (
  safeSetState: (updater: (prev: AuthState) => AuthState) => void,
  loadUserData: (userId: string) => Promise<void>,
  setTimer: (key: string, callback: () => void, delay: number) => void,
  clearTimer: (key: string) => void,
  queueOperation: <T>(operation: () => Promise<T>) => Promise<T>,
  mountedRef: React.MutableRefObject<boolean>
) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = useCallback(async (username: string, password: string) => {
    return queueOperation(async () => {
      if (!mountedRef.current) return;
      
      console.log('🔐 Starting login for:', username);
      
      const timeoutId = setTimer('login-timeout', () => {
        if (mountedRef.current) {
          console.log('🔐 Login timeout triggered');
          safeSetState(prev => ({ ...prev, isLoading: false, error: 'Login timed out' }));
        }
      }, 15000);
      
      try {
        safeSetState(prev => ({ ...prev, isLoading: true, error: null }));
        
        const { user, session, error } = await login(username, password);
        
        clearTimer('login-timeout');
        
        if (!mountedRef.current) return;
        
        if (error || !user || !session) {
          console.error('🔐 Login failed:', error);
          safeSetState(prev => ({ 
            ...prev, 
            isLoading: false, 
            error: error || 'Login failed' 
          }));
          toast({
            variant: "destructive",
            title: "Login Failed",
            description: error || 'Invalid credentials'
          });
          return;
        }
        
        console.log('🔐 Login successful');
        safeSetState(prev => ({
          ...prev,
          isAuthenticated: true,
          user,
          session,
          error: null,
          isLoading: false
        }));
        
        await loadUserData(user.id);
        
        try {
          await activityLogger.logLogin(user.id, user.username);
          console.log('🔐 Login activity logged');
        } catch (activityError) {
          console.warn('🔐 Failed to log login activity:', activityError);
        }
        
        toast({
          title: "Login Successful",
          description: `Welcome back, ${user.username}!`
        });
        
        setTimer('navigation-delay', () => {
          if (mountedRef.current) {
            navigate('/dashboard');
          }
        }, 100);
        
      } catch (error) {
        clearTimer('login-timeout');
        console.error('🔐 Login error:', error);
        if (mountedRef.current) {
          safeSetState(prev => ({ 
            ...prev, 
            isLoading: false, 
            error: 'Login failed. Please try again.' 
          }));
          toast({
            variant: "destructive",
            title: "Login Failed",
            description: 'Login failed. Please try again.'
          });
        }
      }
    });
  }, [toast, navigate, loadUserData, safeSetState, setTimer, clearTimer, queueOperation, mountedRef]);

  return { handleLogin };
};
