
import { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyCredentials } from '@/services/credentialService';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => void;
  logout: () => void;
  register: (username: string, password: string) => void;
  currentUser?: string | null;
  pirateCoins: number;
  addPirateCoins: (amount: number) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [pirateCoins, setPirateCoins] = useState<number>(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in from localStorage
    const loggedIn = localStorage.getItem('pirateLoggedIn') === 'true';
    const username = localStorage.getItem('pirateUsername');
    const coins = localStorage.getItem('pirateCoins');
    setIsAuthenticated(loggedIn);
    setCurrentUser(username);
    setPirateCoins(coins ? parseInt(coins) : 0);
  }, []);

  const login = (username: string, password: string) => {
    // Check credentials against our store
    const credential = verifyCredentials(username, password);
    
    if (credential) {
      localStorage.setItem('pirateLoggedIn', 'true');
      localStorage.setItem('pirateUsername', username);
      localStorage.setItem('pirateCoins', '0');
      setIsAuthenticated(true);
      setCurrentUser(username);
      setPirateCoins(0);
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
    localStorage.removeItem('pirateUsername');
    localStorage.removeItem('pirateCoins');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setPirateCoins(0);
    navigate('/');
  };

  const addPirateCoins = (amount: number) => {
    const newTotal = pirateCoins + amount;
    setPirateCoins(newTotal);
    localStorage.setItem('pirateCoins', newTotal.toString());
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      login, 
      logout, 
      register, 
      currentUser, 
      pirateCoins, 
      addPirateCoins 
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
