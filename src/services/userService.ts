
// Emergency fix: Pure mock implementations to prevent all blocking calls

// Mock balance service - always returns immediately
export const getUserBalance = async (userId: string): Promise<number> => {
  console.log('Mock getUserBalance called for:', userId);
  // Return immediately with mock data
  return Promise.resolve(100);
};

export const updateUserBalance = async (
  userId: string, 
  amount: number, 
  description: string = '', 
  type: 'earn' | 'spend' | 'admin' = 'earn'
): Promise<boolean> => {
  console.log('Mock updateUserBalance called:', { userId, amount, description, type });
  // Return immediately
  return Promise.resolve(true);
};

// Mock transaction service - always returns immediately
export const getUserTransactions = async (userId: string): Promise<any[]> => {
  console.log('Mock getUserTransactions called for:', userId);
  // Return immediately with mock data
  return Promise.resolve([
    {
      id: 'welcome-1',
      timestamp: Date.now(),
      amount: 100,
      description: 'Welcome bonus',
      type: 'admin'
    }
  ]);
};

export const createTransaction = async (
  userId: string, 
  amount: number, 
  description: string, 
  type: 'earn' | 'spend' | 'admin'
): Promise<boolean> => {
  console.log('Mock createTransaction called:', { userId, amount, description, type });
  return Promise.resolve(true);
};

// Mock game unlock service - always returns immediately
export const getUserUnlockedGames = async (userId: string): Promise<string[]> => {
  console.log('Mock getUserUnlockedGames called for:', userId);
  return Promise.resolve([]);
};

export const isGameUnlocked = async (userId: string, gameId: string): Promise<boolean> => {
  console.log('Mock isGameUnlocked called:', { userId, gameId });
  return Promise.resolve(false);
};

export const unlockGame = async (userId: string, gameId: string): Promise<boolean> => {
  console.log('Mock unlockGame called:', { userId, gameId });
  return Promise.resolve(true);
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
