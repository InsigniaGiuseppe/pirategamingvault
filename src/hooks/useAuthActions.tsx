
import { useNavigate } from 'react-router-dom';
import { useAuthLogin } from './useAuthLogin';
import { useAuthRegistration } from './useAuthRegistration';
import { useAuthSession } from './useAuthSession';
import { useCoinsManagement } from './useCoinsManagement';
import { useGameUnlocking } from './useGameUnlocking';

// Combine all hooks into a single useAuthActions hook
export const useAuthActions = () => {
  const { login, isProcessing: isLoginProcessing } = useAuthLogin();
  const { register, isProcessing: isRegistrationProcessing } = useAuthRegistration();
  const { logout } = useAuthSession();
  const { addPirateCoins } = useCoinsManagement();
  const { unlockGame, checkIfGameUnlocked } = useGameUnlocking();
  const navigate = useNavigate();
  
  const isProcessing = isLoginProcessing || isRegistrationProcessing;
  
  return {
    login,
    register,
    logout,
    addPirateCoins,
    unlockGame,
    checkIfGameUnlocked,
    isProcessing,
    navigate
  };
};

// Re-export individual hooks for direct usage
export { useAuthLogin } from './useAuthLogin';
export { useAuthRegistration } from './useAuthRegistration';
export { useAuthSession } from './useAuthSession';
export { useCoinsManagement } from './useCoinsManagement';
export { useGameUnlocking } from './useGameUnlocking';
