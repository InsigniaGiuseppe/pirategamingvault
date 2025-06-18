
import { useContext } from 'react';
import { AuthContext } from './auth/context';

export const useSimpleAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
};

export { SimpleAuthProvider } from './auth/AuthProvider';
export { AuthContext as SimpleAuthContext } from './auth/context';
