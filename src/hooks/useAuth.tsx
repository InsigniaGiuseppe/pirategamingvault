import { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyCredentials } from '@/services/credentialService';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => void;
  logout: () => void;
  currentUser?: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in from localStorage
    const loggedIn = localStorage.getItem('pirateLoggedIn') === 'true';
    const username = localStorage.getItem('pirateUsername');
    setIsAuthenticated(loggedIn);
    setCurrentUser(username);
  }, []);

  const login = (username: string, password: string) => {
    // Check credentials against our store
    const credential = verifyCredentials(username, password);
    
    if (credential) {
      localStorage.setItem('pirateLoggedIn', 'true');
      localStorage.setItem('pirateUsername', username);
      setIsAuthenticated(true);
      setCurrentUser(username);
      navigate('/dashboard');
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid or disabled credentials. Try again or join Discord."
      });
    }
  };

  const logout = () => {
    localStorage.removeItem('pirateLoggedIn');
    localStorage.removeItem('pirateUsername');
    setIsAuthenticated(false);
    setCurrentUser(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, currentUser }}>
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
