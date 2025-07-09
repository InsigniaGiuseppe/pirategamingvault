
import { useState, useCallback, useRef, useEffect, ReactNode } from 'react';
import { AuthContext } from './context';
import { initialState } from './types';
import { useTimerManager } from '@/hooks/useTimerManager';
import { useAuthData } from './useAuthData';
import { useAuthLogin } from './useAuthLogin';
import { useAuthRegister } from './useAuthRegister';
import { useAuthLogout } from './useAuthLogout';
import { useAuthCoins } from './useAuthCoins';
import type { AuthState, AuthContextType } from './types';

export const SimpleAuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>(initialState);
  const mountedRef = useRef(true);
  const operationQueueRef = useRef<Promise<any>>(Promise.resolve());
  const { setTimer, clearTimer, clearAllTimers } = useTimerManager();

  console.log('🔍 AUTH PROVIDER - Current state:', {
    isAuthenticated: state.isAuthenticated,
    userId: state.user?.id,
    username: state.user?.username,
    pirateCoins: state.pirateCoins,
    isLoading: state.isLoading,
    hasError: !!state.error,
    sessionExists: !!state.session
  });

  useEffect(() => {
    return () => {
      console.log('🔍 AUTH PROVIDER - Cleanup triggered');
      mountedRef.current = false;
      clearAllTimers();
    };
  }, [clearAllTimers]);

  const safeSetState = useCallback((updater: (prev: AuthState) => AuthState) => {
    if (mountedRef.current) {
      console.log('🔍 AUTH PROVIDER - State update triggered');
      setState(updater);
    } else {
      console.warn('🔍 AUTH PROVIDER - Attempted state update after unmount');
    }
  }, []);

  const queueOperation = useCallback(async <T,>(operation: () => Promise<T>): Promise<T> => {
    console.log('🔍 AUTH PROVIDER - Queueing operation');
    const currentQueue = operationQueueRef.current;
    const newOperation = currentQueue.then(operation).catch((error) => {
      console.error('🔍 AUTH PROVIDER - Queued operation failed:', error);
      throw error;
    });
    operationQueueRef.current = newOperation.catch(() => {});
    return newOperation;
  }, []);

  const { loadUserData } = useAuthData();
  
  const wrappedLoadUserData = useCallback(async (userId: string) => {
    try {
      console.log('🔍 AUTH PROVIDER - Loading user data for:', userId);
      await loadUserData(userId, safeSetState, mountedRef);
    } catch (error) {
      console.error('🔍 AUTH PROVIDER - Failed to load user data:', error);
      if (mountedRef.current) {
        safeSetState(prev => ({ 
          ...prev, 
          error: 'Failed to load user data',
          isLoading: false 
        }));
      }
    }
  }, [loadUserData, safeSetState]);

  const { handleLogin } = useAuthLogin(safeSetState, wrappedLoadUserData, setTimer, clearTimer, queueOperation, mountedRef);
  const { handleRegister } = useAuthRegister(safeSetState, wrappedLoadUserData, setTimer, clearTimer, queueOperation, mountedRef);
  const { handleLogout } = useAuthLogout(state, safeSetState, queueOperation, mountedRef);
  const { addPirateCoins, unlockGame, checkIfGameUnlocked } = useAuthCoins(state, wrappedLoadUserData, mountedRef);

  const refreshUserData = useCallback(async () => {
    console.log('🔍 AUTH PROVIDER - Refreshing user data');
    if (state.user?.id) {
      await wrappedLoadUserData(state.user.id);
    }
  }, [state.user?.id, wrappedLoadUserData]);

  // Check for existing authentication on app start
  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      if (!isMounted || !mountedRef.current) return;
      
      console.log('🔍 AUTH PROVIDER - Starting auth check...');
      
      try {
        const userStr = localStorage.getItem('pirate_user');
        const sessionStr = localStorage.getItem('pirate_session');
        
        console.log('🔍 AUTH PROVIDER - Checking localStorage:', {
          hasUser: !!userStr,
          hasSession: !!sessionStr,
          userStr: userStr,
          sessionStr: sessionStr
        });
        
        if (userStr && sessionStr) {
          const storedUser = JSON.parse(userStr);
          const storedSession = JSON.parse(sessionStr);
          
          console.log('🔍 AUTH PROVIDER - Found stored auth data:', {
            user: storedUser,
            session: storedSession,
            sessionExpiresAt: storedSession.expires_at,
            currentTime: Math.floor(Date.now() / 1000),
            isExpired: storedSession.expires_at <= Math.floor(Date.now() / 1000)
          });
          
          // Simplified session check - if session exists and has expires_at, consider it valid
          if (storedSession.expires_at && storedSession.expires_at > Math.floor(Date.now() / 1000)) {
            console.log('🔍 AUTH PROVIDER - Valid session found, restoring authenticated state');
            
            if (!isMounted || !mountedRef.current) return;
            
            // Restore authenticated state immediately
            safeSetState(prev => ({
              ...prev,
              isAuthenticated: true,
              user: storedUser,
              session: storedSession,
              isLoading: false,
              error: null,
              pirateCoins: 5, // Default pirate coins
              transactions: [{
                id: 'welcome-1',
                timestamp: Date.now(),
                amount: 5,
                description: 'Welcome bonus',
                type: 'admin' as const
              }],
              unlockedGames: []
            }));
            
            console.log('🔍 AUTH PROVIDER - Auth state restored successfully');
            
            // Load additional user data in background
            setTimeout(() => {
              if (isMounted && mountedRef.current && storedUser.id) {
                console.log('🔍 AUTH PROVIDER - Loading user data after auth restoration');
                wrappedLoadUserData(storedUser.id);
              }
            }, 100);
            
            return;
          } else {
            console.log('🔍 AUTH PROVIDER - Session expired or invalid, clearing storage');
            localStorage.removeItem('pirate_user');
            localStorage.removeItem('pirate_session');
          }
        }
        
        console.log('🔍 AUTH PROVIDER - No valid session found, setting unauthenticated state');
        if (isMounted && mountedRef.current) {
          safeSetState(prev => ({ 
            ...prev, 
            isLoading: false,
            isAuthenticated: false,
            user: null,
            session: null,
            error: null
          }));
        }
      } catch (error) {
        console.error('🔍 AUTH PROVIDER - Auth check error:', error);
        localStorage.removeItem('pirate_user');
        localStorage.removeItem('pirate_session');
        if (isMounted && mountedRef.current) {
          safeSetState(prev => ({ 
            ...prev, 
            isLoading: false,
            isAuthenticated: false,
            user: null,
            session: null,
            error: 'Auth check failed' 
          }));
        }
      }
    };

    // Run auth check immediately
    checkAuth();
    
    return () => {
      isMounted = false;
    };
  }, [wrappedLoadUserData, safeSetState]);

  const contextValue: AuthContextType = {
    ...state,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    addPirateCoins,
    unlockGame,
    checkIfGameUnlocked,
    refreshUserData
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default SimpleAuthProvider;
