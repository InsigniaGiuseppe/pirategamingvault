
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '@/services/customAuthService';
import { activityLogger } from '@/services/activityLoggingService';
import { AuthState, initialState } from './types';

export const useAuthLogout = (
  state: AuthState,
  safeSetState: (updater: () => AuthState) => void,
  queueOperation: <T>(operation: () => Promise<T>) => Promise<T>,
  mountedRef: React.MutableRefObject<boolean>
) => {
  const navigate = useNavigate();

  const handleLogout = useCallback(async () => {
    return queueOperation(async () => {
      try {
        console.log('🔐 Starting logout process');
        
        if (state.user?.id && state.user?.username) {
          try {
            await activityLogger.logLogout(state.user.id, state.user.username);
            console.log('🔐 Logout activity logged');
          } catch (activityError) {
            console.warn('🔐 Failed to log logout activity:', activityError);
          }
        }
        
        await logout();
        
        localStorage.removeItem('pirate_user');
        localStorage.removeItem('pirate_session');
        
        if (mountedRef.current) {
          safeSetState(() => initialState);
          navigate('/');
        }
        console.log('🔐 Logout completed');
      } catch (error) {
        console.error('🔐 Logout error:', error);
      }
    });
  }, [navigate, state.user, safeSetState, queueOperation, mountedRef]);

  return { handleLogout };
};
