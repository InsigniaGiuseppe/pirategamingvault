// Mock implementations to prevent blocking calls

// Mock balance service
export const getUserBalance = async (userId: string): Promise<number> => {
  console.log('Mock getUserBalance called for:', userId);
  return 100; // Default mock balance
};

export const updateUserBalance = async (
  userId: string, 
  amount: number, 
  description: string = '', 
  type: 'earn' | 'spend' | 'admin' = 'earn'
): Promise<boolean> => {
  console.log('Mock updateUserBalance called:', { userId, amount, description, type });
  return true;
};

// Mock transaction service
export const getUserTransactions = async (userId: string): Promise<any[]> => {
  console.log('Mock getUserTransactions called for:', userId);
  return [
    {
      id: 'welcome-1',
      timestamp: Date.now(),
      amount: 100,
      description: 'Welcome bonus',
      type: 'admin'
    }
  ];
};

export const createTransaction = async (
  userId: string, 
  amount: number, 
  description: string, 
  type: 'earn' | 'spend' | 'admin'
): Promise<boolean> => {
  console.log('Mock createTransaction called:', { userId, amount, description, type });
  return true;
};

// Mock game unlock service
export const getUserUnlockedGames = async (userId: string): Promise<string[]> => {
  console.log('Mock getUserUnlockedGames called for:', userId);
  return [];
};

export const isGameUnlocked = async (userId: string, gameId: string): Promise<boolean> => {
  console.log('Mock isGameUnlocked called:', { userId, gameId });
  return false;
};

export const unlockGame = async (userId: string, gameId: string): Promise<boolean> => {
  console.log('Mock unlockGame called:', { userId, gameId });
  return true;
};

// Export the profile type for use in other components
export interface Profile {
  id: string;
  username: string;
  created_at: string;
}

// Re-export from specialized service modules (keeping these for compatibility)
export * from './authService';
export * from './registrationService';
export * from './balanceService';
export * from './transactionService';
export * from './gameUnlockService';
