
import { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyCredentials } from '@/services/credentialService';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  timestamp: number;
  amount: number;
  description: string;
  type: 'earn' | 'spend' | 'admin';
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => void;
  logout: () => void;
  register: (username: string, password: string) => void;
  currentUser?: string | null;
  pirateCoins: number;
  addPirateCoins: (amount: number, description?: string) => void;
  transactions: Transaction[];
  unlockedGames: string[];
  unlockGame: (gameId: string, cost: number) => void;
  checkIfGameUnlocked: (gameId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [pirateCoins, setPirateCoins] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [unlockedGames, setUnlockedGames] = useState<string[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in from localStorage
    const loggedIn = localStorage.getItem('pirateLoggedIn') === 'true';
    const username = localStorage.getItem('pirateUsername');
    
    if (loggedIn && username) {
      setIsAuthenticated(loggedIn);
      setCurrentUser(username);
      
      // Load user's coin balance
      const coins = localStorage.getItem('pirateCoins');
      setPirateCoins(coins ? parseInt(coins) : 0);
      
      // Load user's transaction history
      const savedTransactions = localStorage.getItem('pirateTransactions');
      if (savedTransactions) {
        try {
          setTransactions(JSON.parse(savedTransactions));
        } catch (e) {
          console.error('Error parsing transactions', e);
          setTransactions([]);
        }
      }
      
      // Load user's unlocked games
      const savedUnlockedGames = localStorage.getItem('unlockedGames');
      if (savedUnlockedGames) {
        try {
          setUnlockedGames(JSON.parse(savedUnlockedGames));
        } catch (e) {
          console.error('Error parsing unlocked games', e);
          setUnlockedGames(['1', '2', '3', '4']); // Default to first 4 games
        }
      } else {
        setUnlockedGames(['1', '2', '3', '4']); // Default to first 4 games
      }
    }
  }, []);

  const login = (username: string, password: string) => {
    // Check credentials against our store
    const credential = verifyCredentials(username, password);
    
    if (credential) {
      localStorage.setItem('pirateLoggedIn', 'true');
      localStorage.setItem('pirateUsername', username);
      
      // Initialize or load coin balance
      const existingCoins = localStorage.getItem('pirateCoins');
      if (!existingCoins) {
        localStorage.setItem('pirateCoins', '50'); // Start with 50 coins for new users
        setPirateCoins(50);
      } else {
        setPirateCoins(parseInt(existingCoins));
      }
      
      setIsAuthenticated(true);
      setCurrentUser(username);
      
      // Initialize or load transaction history
      const existingTransactions = localStorage.getItem('pirateTransactions');
      if (!existingTransactions) {
        const initialTransaction = [{
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          amount: 50,
          description: 'Welcome bonus',
          type: 'admin'
        }];
        setTransactions(initialTransaction);
        localStorage.setItem('pirateTransactions', JSON.stringify(initialTransaction));
      } else {
        try {
          setTransactions(JSON.parse(existingTransactions));
        } catch (e) {
          console.error('Error parsing transactions', e);
          setTransactions([]);
        }
      }
      
      // Initialize or load unlocked games
      const existingUnlockedGames = localStorage.getItem('unlockedGames');
      if (!existingUnlockedGames) {
        setUnlockedGames(['1', '2', '3', '4']); // First 4 games are free
        localStorage.setItem('unlockedGames', JSON.stringify(['1', '2', '3', '4']));
      } else {
        try {
          setUnlockedGames(JSON.parse(existingUnlockedGames));
        } catch (e) {
          console.error('Error parsing unlocked games', e);
          setUnlockedGames(['1', '2', '3', '4']);
        }
      }
      
      navigate('/dashboard');
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid or disabled credentials. Try again or join Discord."
      });
    }
  };

  const register = (username: string, password: string) => {
    try {
      // Check if username already exists
      const existingCred = verifyCredentials(username, password);
      if (existingCred) {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: "Username already exists. Try a different username."
        });
        return;
      }

      // Add new credential
      import('@/services/credentialService').then(({ addCredential }) => {
        addCredential(username, password);
        
        // Auto login after registration
        login(username, password);
        
        toast({
          title: "Registration Successful",
          description: "Welcome to Pirate Gaming!"
        });
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: "An error occurred during registration. Please try again."
      });
    }
  };

  const logout = () => {
    localStorage.removeItem('pirateLoggedIn');
    // We won't remove the other items so they persist between sessions
    setIsAuthenticated(false);
    setCurrentUser(null);
    setPirateCoins(0);
    navigate('/');
  };

  const addPirateCoins = (amount: number, description: string = '') => {
    const newTotal = Math.max(0, pirateCoins + amount);
    setPirateCoins(newTotal);
    localStorage.setItem('pirateCoins', newTotal.toString());
    
    // Add transaction record
    const transaction: Transaction = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      amount: amount,
      description: description || (amount > 0 ? 'Earned coins' : 'Spent coins'),
      type: amount > 0 ? (description.includes('admin') ? 'admin' : 'earn') : 'spend'
    };
    
    const updatedTransactions = [...transactions, transaction];
    setTransactions(updatedTransactions);
    localStorage.setItem('pirateTransactions', JSON.stringify(updatedTransactions));
  };

  const unlockGame = (gameId: string, cost: number) => {
    // Check if user has enough coins
    if (pirateCoins < cost) {
      toast({
        variant: "destructive",
        title: "Not Enough Coins",
        description: `You need ${cost - pirateCoins} more coins to unlock this game.`
      });
      return false;
    }
    
    // Deduct coins
    addPirateCoins(-cost, `Unlocked game #${gameId}`);
    
    // Add to unlocked games
    const updatedUnlockedGames = [...unlockedGames, gameId];
    setUnlockedGames(updatedUnlockedGames);
    localStorage.setItem('unlockedGames', JSON.stringify(updatedUnlockedGames));
    
    return true;
  };

  const checkIfGameUnlocked = (gameId: string) => {
    return unlockedGames.includes(gameId) || gameId === '1' || gameId === '2' || gameId === '3' || gameId === '4';
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      login, 
      logout, 
      register, 
      currentUser, 
      pirateCoins, 
      addPirateCoins,
      transactions,
      unlockedGames,
      unlockGame,
      checkIfGameUnlocked
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
