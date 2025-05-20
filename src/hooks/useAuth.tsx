
import { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { 
  verifyCredentials, 
  registerUser, 
  getUserBalance, 
  updateUserBalance,
  getUserTransactions,
  getUserUnlockedGames
} from '@/services/userService';
import { unlockGame, checkGameUnlocked } from '@/services/gameService';

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
      
      // Load user's coin balance from Supabase
      const loadUserData = async () => {
        try {
          // Get balance
          const balance = await getUserBalance(username);
          setPirateCoins(balance);
          
          // Get transactions
          const userTransactions = await getUserTransactions(username);
          setTransactions(userTransactions);
          
          // Get unlocked games
          const userUnlockedGames = await getUserUnlockedGames(username);
          setUnlockedGames(userUnlockedGames);
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      };
      
      loadUserData();
    }
  }, []);

  const login = async (username: string, password: string) => {
    // Check credentials against Supabase
    const credential = await verifyCredentials(username, password);
    
    if (credential) {
      localStorage.setItem('pirateLoggedIn', 'true');
      localStorage.setItem('pirateUsername', username);
      
      // Get user's balance from Supabase
      const balance = await getUserBalance(username);
      setPirateCoins(balance);
      
      setIsAuthenticated(true);
      setCurrentUser(username);
      
      // Get user transactions
      const userTransactions = await getUserTransactions(username);
      setTransactions(userTransactions);
      
      // Get unlocked games
      const userUnlockedGames = await getUserUnlockedGames(username);
      setUnlockedGames(userUnlockedGames);
      
      navigate('/dashboard');
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid or disabled credentials. Try again or join Discord."
      });
    }
  };

  const register = async (username: string, password: string) => {
    try {
      // Register user with Supabase - default welcome bonus is now 10 coins
      const newUser = await registerUser(username, password);
      
      if (!newUser) {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: "Username already exists or an error occurred. Try a different username."
        });
        return;
      }

      // Auto login after registration
      await login(username, password);
      
      toast({
        title: "Registration Successful",
        description: "Welcome to Pirate Gaming!"
      });
    } catch (error) {
      console.error('Registration error:', error);
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

  const addPirateCoins = async (amount: number, description: string = '') => {
    if (!currentUser) return;
    
    const transactionType: 'earn' | 'spend' | 'admin' = 
      amount > 0 
        ? (description.includes('admin') ? 'admin' : 'earn') 
        : 'spend';
    
    // Update balance in Supabase
    const success = await updateUserBalance(currentUser, amount, description, transactionType);
    
    if (success) {
      // Update local state
      const newTotal = Math.max(0, pirateCoins + amount);
      setPirateCoins(newTotal);
      
      // Get updated transactions list
      const updatedTransactions = await getUserTransactions(currentUser);
      setTransactions(updatedTransactions);
    }
  };

  const handleUnlockGame = async (gameId: string, cost: number) => {
    if (!currentUser) return false;
    
    // Check if user has enough coins
    if (pirateCoins < cost) {
      toast({
        variant: "destructive",
        title: "Not Enough Coins",
        description: `You need ${cost - pirateCoins} more coins to unlock this game.`
      });
      return false;
    }
    
    // Unlock game with Supabase
    const success = await unlockGame(gameId, currentUser, cost);
    
    if (success) {
      // Update local coin state
      setPirateCoins(prev => Math.max(0, prev - cost));
      
      // Update unlocked games list
      const updatedGames = await getUserUnlockedGames(currentUser);
      setUnlockedGames(updatedGames);
      
      // Get updated transactions list
      const updatedTransactions = await getUserTransactions(currentUser);
      setTransactions(updatedTransactions);
      
      return true;
    }
    
    return false;
  };

  const checkIfGameUnlocked = (gameId: string) => {
    return unlockedGames.includes(gameId);
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
      unlockGame: handleUnlockGame,
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
