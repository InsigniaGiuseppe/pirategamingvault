
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

  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      if (!isMounted || !mountedRef.current) return;
      
      console.log('🔍 AUTH PROVIDER DEBUG - Starting auth check...');
      console.log('🔍 AUTH PROVIDER DEBUG - Current localStorage:', {
        pirate_user: localStorage.getItem('pirate_user'),
        pirate_session: localStorage.getItem('pirate_session')
      });
      
      try {
        const userStr = localStorage.getItem('pirate_user');
        const sessionStr = localStorage.getItem('pirate_session');
        
        console.log('🔍 AUTH PROVIDER DEBUG - Checking localStorage:', {
          hasUser: !!userStr,
          hasSession: !!sessionStr,
          userStr: userStr,
          sessionStr: sessionStr
        });
        
        if (userStr && sessionStr) {
          const storedUser = JSON.parse(userStr);
          const storedSession = JSON.parse(sessionStr);
          
          console.log('🔍 AUTH PROVIDER DEBUG - Parsed stored data:', {
            storedUser,
            storedSession,
            sessionExpiry: storedSession.expires_at,
            currentTime: Math.floor(Date.now() / 1000),
            isExpired: storedSession.expires_at <= Math.floor(Date.now() / 1000),
            expiryCheck: `${storedSession.expires_at} vs ${Math.floor(Date.now() / 1000)}`
          });
          
          // Fix the session validation - check expires_at as Unix timestamp
          if (storedSession.expires_at && storedSession.expires_at > Math.floor(Date.now() / 1000)) {
            console.log('🔍 AUTH PROVIDER DEBUG - Valid session found, setting authenticated state');
            
            if (!isMounted || !mountedRef.current) return;
            
            safeSetState(prev => ({
              ...prev,
              isAuthenticated: true,
              user: storedUser,
              session: storedSession,
              isLoading: false,
              error: null
            }));
            
            // Load user data after setting auth state
            setTimeout(() => {
              if (isMounted && mountedRef.current) {
                console.log('🔍 AUTH PROVIDER DEBUG - Loading user data after auth state set');
                wrappedLoadUserData(storedUser.id);
              }
            }, 100);
            
            return;
          } else {
            console.log('🔍 AUTH PROVIDER DEBUG - Session expired, clearing localStorage');
            localStorage.removeItem('pirate_user');
            localStorage.removeItem('pirate_session');
          }
        }
        
        console.log('🔍 AUTH PROVIDER DEBUG - No valid session found, setting unauthenticated');
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
