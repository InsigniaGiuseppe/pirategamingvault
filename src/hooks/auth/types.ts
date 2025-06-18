
import type { CustomUser, CustomSession } from '@/services/customAuthService';

export interface AuthState {
  isAuthenticated: boolean;
  user: CustomUser | null;
  session: CustomSession | null;
  isLoading: boolean;
  error: string | null;
  pirateCoins: number;
  transactions: any[];
  unlockedGames: string[];
}

export interface AuthActions {
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  addPirateCoins: (amount: number, description?: string) => Promise<void>;
  unlockGame: (gameId: string, cost: number) => Promise<boolean>;
  checkIfGameUnlocked: (gameId: string) => boolean;
  refreshUserData: () => Promise<void>;
}

export type AuthContextType = AuthState & AuthActions;

export const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  session: null,
  isLoading: false,
  error: null,
  pirateCoins: 0,
  transactions: [],
  unlockedGames: []
};
