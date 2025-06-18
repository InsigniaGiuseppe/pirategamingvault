
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

  console.log('🔐 SimpleAuthProvider - Current state:', {
    isAuthenticated: state.isAuthenticated,
    userId: state.user?.id,
    pirateCoins: state.pirateCoins,
    transactionCount: state.transactions.length,
    unlockedGamesCount: state.unlockedGames.length,
    isLoading: state.isLoading,
    hasError: !!state.error
  });

  useEffect(() => {
    return () => {
      console.log('🔐 SimpleAuthProvider - Cleanup triggered');
      mountedRef.current = false;
      clearAllTimers();
    };
  }, [clearAllTimers]);

  const safeSetState = useCallback((updater: (prev: AuthState) => AuthState) => {
    if (mountedRef.current) {
      console.log('🔐 SimpleAuthProvider - State update triggered');
      setState(updater);
    } else {
      console.warn('🔐 SimpleAuthProvider - Attempted state update after unmount');
    }
  }, []);

  const queueOperation = useCallback(async <T>(operation: () => Promise<T>): Promise<T> => {
    console.log('🔐 SimpleAuthProvider - Queueing operation');
    const currentQueue = operationQueueRef.current;
    const newOperation = currentQueue.then(operation).catch((error) => {
      console.error('🔐 SimpleAuthProvider - Queued operation failed:', error);
      throw error;
    });
    operationQueueRef.current = newOperation.catch(() => {});
    return newOperation;
  }, []);

  const { loadUserData } = useAuthData();
  
  const wrappedLoadUserData = useCallback(async (userId: string) => {
    await loadUserData(userId, safeSetState, mountedRef);
  }, [loadUserData, safeSetState]);

  const { handleLogin } = useAuthLogin(safeSetState, wrappedLoadUserData, setTimer, clearTimer, queueOperation, mountedRef);
  const { handleRegister } = useAuthRegister(safeSetState, wrappedLoadUserData, setTimer, clearTimer, queueOperation, mountedRef);
  const { handleLogout } = useAuthLogout(state, safeSetState, queueOperation, mountedRef);
  const { addPirateCoins, unlockGame, checkIfGameUnlocked } = useAuthCoins(state, wrappedLoadUserData, mountedRef);

  const refreshUserData = useCallback(async () => {
    console.log('🔐 SimpleAuthProvider - Refreshing user data');
    if (state.user?.id) {
      await wrappedLoadUserData(state.user.id);
    }
  }, [state.user?.id, wrappedLoadUserData]);

  useEffect(() => {
    console.log('🔐 SimpleAuthProvider - Starting auth check...');
    
    const checkAuth = async () => {
      if (!mountedRef.current) return;
      
      try {
        const userStr = localStorage.getItem('pirate_user');
        const sessionStr = localStorage.getItem('pirate_session');
        
        console.log('🔐 SimpleAuthProvider - Checking localStorage:', {
          hasUser: !!userStr,
          hasSession: !!sessionStr
        });
        
        if (userStr && sessionStr) {
          const storedUser = JSON.parse(userStr);
          const storedSession = JSON.parse(sessionStr);
          
          if (storedSession.expires_at && storedSession.expires_at * 1000 > Date.now()) {
            console.log('🔐 SimpleAuthProvider - Valid session found');
            
            if (!mountedRef.current) return;
            
            safeSetState(prev => ({
              ...prev,
              isAuthenticated: true,
              user: storedUser,
              session: storedSession
            }));
            
            await wrappedLoadUserData(storedUser.id);
            return;
          } else {
            console.log('🔐 SimpleAuthProvider - Session expired');
            localStorage.removeItem('pirate_user');
            localStorage.removeItem('pirate_session');
          }
        }
        
        console.log('🔐 SimpleAuthProvider - No valid session found');
      } catch (error) {
        console.error('🔐 SimpleAuthProvider - Auth check error:', error);
        localStorage.removeItem('pirate_user');
        localStorage.removeItem('pirate_session');
      }
    };

    checkAuth();
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
