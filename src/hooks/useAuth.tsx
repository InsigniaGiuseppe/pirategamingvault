
import { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in from localStorage
    const loggedIn = localStorage.getItem('pirateLoggedIn') === 'true';
    setIsAuthenticated(loggedIn);
  }, []);

  const login = (email: string, password: string) => {
    // Simple validation - just check if fields are not empty
    if (email.trim() && password.trim()) {
      localStorage.setItem('pirateLoggedIn', 'true');
      setIsAuthenticated(true);
      navigate('/dashboard');
    }
  };

  const logout = () => {
    localStorage.removeItem('pirateLoggedIn');
    setIsAuthenticated(false);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
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
