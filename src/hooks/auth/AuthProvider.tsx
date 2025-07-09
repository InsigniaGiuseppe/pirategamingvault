
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

  console.log('🔍 AUTH PROVIDER DEBUG - Current state:', {
    isAuthenticated: state.isAuthenticated,
    userId: state.user?.id,
    username: state.user?.username,
    pirateCoins: state.pirateCoins,
    transactionCount: state.transactions.length,
    unlockedGamesCount: state.unlockedGames.length,
    isLoading: state.isLoading,
    hasError: !!state.error,
    sessionExists: !!state.session
  });

  useEffect(() => {
    return () => {
      console.log('🔍 AUTH PROVIDER DEBUG - Cleanup triggered');
      mountedRef.current = false;
      clearAllTimers();
    };
  }, [clearAllTimers]);

  const safeSetState = useCallback((updater: (prev: AuthState) => AuthState) => {
    if (mountedRef.current) {
      console.log('🔍 AUTH PROVIDER DEBUG - State update triggered');
      setState(updater);
    } else {
      console.warn('🔍 AUTH PROVIDER DEBUG - Attempted state update after unmount');
    }
  }, []);

  const queueOperation = useCallback(async <T,>(operation: () => Promise<T>): Promise<T> => {
    console.log('🔍 AUTH PROVIDER DEBUG - Queueing operation');
    const currentQueue = operationQueueRef.current;
    const newOperation = currentQueue.then(operation).catch((error) => {
      console.error('🔍 AUTH PROVIDER DEBUG - Queued operation failed:', error);
      throw error;
    });
    operationQueueRef.current = newOperation.catch(() => {});
    return newOperation;
  }, []);

  const { loadUserData } = useAuthData();
  
  const wrappedLoadUserData = useCallback(async (userId: string) => {
    try {
      console.log('🔍 AUTH PROVIDER DEBUG - Loading user data for:', userId);
      await loadUserData(userId, safeSetState, mountedRef);
    } catch (error) {
      console.error('🔍 AUTH PROVIDER DEBUG - Failed to load user data:', error);
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
    console.log('🔍 AUTH PROVIDER DEBUG - Refreshing user data');
    if (state.user?.id) {
      await wrappedLoadUserData(state.user.id);
    }
  }, [state.user?.id, wrappedLoadUserData]);

  // Check for existing authentication on app start
  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      if (!isMounted || !mountedRef.current) return;
      
      console.log('🔍 AUTH PROVIDER DEBUG - Starting auth check...');
      
      try {
        const userStr = localStorage.getItem('pirate_user');
        const sessionStr = localStorage.getItem('pirate_session');
        
        console.log('🔍 AUTH PROVIDER DEBUG - Checking localStorage:', {
          hasUser: !!userStr,
          hasSession: !!sessionStr
        });
        
        if (userStr && sessionStr) {
          const storedUser = JSON.parse(userStr);
          const storedSession = JSON.parse(sessionStr);
          
          console.log('🔍 AUTH PROVIDER DEBUG - Found stored auth data, validating session...');
          
          // Check if session is still valid (expires_at is Unix timestamp)
          if (storedSession.expires_at && storedSession.expires_at > Math.floor(Date.now() / 1000)) {
            console.log('🔍 AUTH PROVIDER DEBUG - Valid session found, restoring authenticated state');
            
            if (!isMounted || !mountedRef.current) return;
            
            // Restore authenticated state
            safeSetState(prev => ({
              ...prev,
              isAuthenticated: true,
              user: storedUser,
              session: storedSession,
              isLoading: false,
              error: null
            }));
            
            // Load user data after restoring auth state
            setTimeout(() => {
              if (isMounted && mountedRef.current && storedUser.id) {
                console.log('🔍 AUTH PROVIDER DEBUG - Loading user data after auth restoration');
                wrappedLoadUserData(storedUser.id);
              }
            }, 100);
            
            return;
          } else {
            console.log('🔍 AUTH PROVIDER DEBUG - Session expired, clearing storage');
            localStorage.removeItem('pirate_user');
            localStorage.removeItem('pirate_session');
          }
        }
        
        console.log('🔍 AUTH PROVIDER DEBUG - No valid session found, setting unauthenticated state');
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
        console.error('🔍 AUTH PROVIDER DEBUG - Auth check error:', error);
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
