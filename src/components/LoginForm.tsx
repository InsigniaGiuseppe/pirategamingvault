import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/hooks/useAuth';
import { LogIn, User, Lock, Loader2, AlertCircle, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import { checkPasswordCompromised } from '@/utils/passwordSecurity';
import PasswordSuggestion from './PasswordSuggestion';

interface LoginFormProps {
  onLogin?: (username: string, password: string) => void;
}

const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [activeTab, setActiveTab] = useState('login');
  const [registrationInProgress, setRegistrationInProgress] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isCheckingPassword, setIsCheckingPassword] = useState(false);
  const [isPasswordCompromised, setIsPasswordCompromised] = useState(false);
  const [showPasswordSuggestion, setShowPasswordSuggestion] = useState(false);
  const [errorDismissTimer, setErrorDismissTimer] = useState<number | null>(null);
  const { login, register, isLoading } = useAuth();
  const { toast } = useToast();

  // Simplified password check to prevent loops
  useEffect(() => {
    const checkPassword = async () => {
      if (registerPassword.length >= 8) { // Only check longer passwords
        setIsCheckingPassword(true);
        try {
          const compromised = await checkPasswordCompromised(registerPassword);
          setIsPasswordCompromised(compromised);
          
          if (compromised && !showPasswordSuggestion) {
            setShowPasswordSuggestion(true);
          } else if (!compromised && showPasswordSuggestion) {
            setShowPasswordSuggestion(false);
          }
        } catch (error) {
          console.error("Password check failed:", error);
          // Don't block registration if check fails
          setIsPasswordCompromised(false);
        } finally {
          setIsCheckingPassword(false);
        }
      } else {
        setIsPasswordCompromised(false);
        setShowPasswordSuggestion(false);
      }
    };

    // Debounce the check
    const handler = setTimeout(() => {
      if (registerPassword && activeTab === 'register') {
        checkPassword();
      }
    }, 1000); // Increased debounce time

    return () => clearTimeout(handler);
  }, [registerPassword, activeTab, showPasswordSuggestion]);

  // Auto-dismiss error messages
  useEffect(() => {
    if (errorDismissTimer) {
      window.clearTimeout(errorDismissTimer);
    }
    
    if (formError) {
      const timer = window.setTimeout(() => {
        setFormError(null);
      }, 6000);
      
      setErrorDismissTimer(timer as unknown as number);
    }
    
    return () => {
      if (errorDismissTimer) {
        window.clearTimeout(errorDismissTimer);
      }
    };
  }, [formError, errorDismissTimer]);

  const clearErrors = () => {
    setFormError(null);
    if (errorDismissTimer) {
      window.clearTimeout(errorDismissTimer);
      setErrorDismissTimer(null);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    
    if (isLoading || registrationInProgress) {
      return;
    }
    
    if (!username.trim()) {
      setFormError('Please enter your username');
      return;
    }
    
    if (!password) {
      setFormError('Please enter your password');
      return;
    }
    
    try {
      console.log('Initiating login process for:', username);
      if (onLogin) {
        await onLogin(username, password);
      } else {
        await login(username, password);
      }
    } catch (error) {
      console.error('Login error in component:', error);
      setFormError('An error occurred during login. Please try again.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    
    if (isLoading || registrationInProgress) {
      return;
    }
    
    if (!registerUsername.trim()) {
      setFormError('Please enter a username');
      return;
    }
    
    if (!registerPassword) {
      setFormError('Please enter a password');
      return;
    }
    
    if (registerPassword.length < 5) {
      setFormError('Password must be at least 5 characters long');
      return;
    }
    
    if (registerPassword !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    
    try {
      setRegistrationInProgress(true);
      
      console.log('Initiating registration for:', registerUsername);
      await register(registerUsername, registerPassword);
      
      // Clear form after successful registration
      setRegisterUsername('');
      setRegisterPassword('');
      setConfirmPassword('');
      setShowPasswordSuggestion(false);
      
    } catch (error) {
      console.error('Registration error in component:', error);
      setFormError('An error occurred during registration. Please try again.');
    } finally {
      setRegistrationInProgress(false);
    }
  };

  const handleUseRecommendedPassword = (password: string) => {
    setRegisterPassword(password);
    setConfirmPassword(password);
    setShowPasswordSuggestion(false);
    setIsPasswordCompromised(false);
  };

  const handleDismissPasswordSuggestion = () => {
    setShowPasswordSuggestion(false);
  };

  const handlePasswordInputFocus = () => {
    if (formError && formError.includes("password")) {
      clearErrors();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white rounded-xl shadow-saas">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <img 
            src="/lovable-uploads/e658c565-6755-4834-9495-f23f5cbac18c.png" 
            alt="Pirate Gaming Logo" 
            className="h-16"
            style={{ filter: 'brightness(0)' }}
          />
        </div>
        <h2 className="text-2xl font-bold text-black mb-2 font-heading">Welcome to the PIRATE VAULT</h2>
        <p className="text-gray-600">Enter your credentials or create a new account</p>
      </div>
      
      {formError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 flex items-start gap-2 animate-fade-in">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <span>{formError}</span>
        </div>
      )}
      
      <Tabs defaultValue="login" value={activeTab} onValueChange={(val) => {
        setActiveTab(val);
        clearErrors();
        setShowPasswordSuggestion(false);
      }}>
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="login">Sign In</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
        
        <TabsContent value="login">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-black block">Username</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    clearErrors();
                  }}
                  className="bg-white border-2 border-gray-300 text-black pl-10 placeholder:text-gray-400 focus:border-black focus:ring-black"
                  disabled={isLoading || registrationInProgress}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-black flex justify-between items-center">
                <span>Password</span>
                <a href="#" className="text-black text-xs hover:underline">Forgot password?</a>
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearErrors();
                  }}
                  className="bg-white border-2 border-gray-300 text-black pl-10 placeholder:text-gray-400 focus:border-black focus:ring-black"
                  disabled={isLoading || registrationInProgress}
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="bg-white text-black border-2 border-black w-full py-6 rounded-md flex gap-2 items-center justify-center font-medium hover:bg-black hover:text-white"
              disabled={isLoading || registrationInProgress}
            >
              {(isLoading || registrationInProgress) ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <LogIn size={18} />
              )}
              Sign in to your vault
            </Button>
            
            <Button 
              type="button" 
              className="bg-gray-100 text-gray-700 border border-gray-300 w-full py-2 rounded-md flex gap-2 items-center justify-center text-xs hover:bg-gray-200"
              onClick={() => {
                if (onLogin) {
                  onLogin('test', 'test');
                } else {
                  login('test', 'test');
                }
              }}
              disabled={isLoading || registrationInProgress}
            >
              Quick Test Login (test/test)
            </Button>
          </form>
        </TabsContent>
        
        <TabsContent value="register">
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="registerUsername" className="text-sm font-medium text-black block">Username</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <Input
                  id="registerUsername"
                  type="text"
                  placeholder="Choose a username"
                  value={registerUsername}
                  onChange={(e) => {
                    setRegisterUsername(e.target.value);
                    clearErrors();
                  }}
                  className="bg-white border-2 border-gray-300 text-black pl-10 placeholder:text-gray-400 focus:border-black focus:ring-black"
                  disabled={isLoading || registrationInProgress}
                />
              </div>
              <p className="text-xs text-gray-500">Choose any username you like</p>
            </div>
            
            {showPasswordSuggestion && (
              <PasswordSuggestion 
                onUsePassword={handleUseRecommendedPassword} 
                onDismiss={handleDismissPasswordSuggestion}
              />
            )}
            
            <div className="space-y-2">
              <label htmlFor="registerPassword" className="text-sm font-medium text-black flex justify-between items-center">
                <span>Password</span>
                {isPasswordCompromised && (
                  <span className="text-xs text-red-500 flex items-center gap-1">
                    <ShieldAlert size={12} />
                    Compromised password
                  </span>
                )}
                {!isPasswordCompromised && registerPassword.length >= 5 && !isCheckingPassword && (
                  <span className="text-xs text-green-500 flex items-center gap-1">
                    <ShieldCheck size={12} />
                    Password not breached
                  </span>
                )}
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <Input
                  id="registerPassword"
                  type="password"
                  placeholder="Create a password"
                  value={registerPassword}
                  onChange={(e) => {
                    setRegisterPassword(e.target.value);
                    clearErrors();
                  }}
                  onFocus={handlePasswordInputFocus}
                  className={`bg-white border-2 ${isPasswordCompromised ? 'border-red-300' : 'border-gray-300'} text-black pl-10 placeholder:text-gray-400 focus:border-black focus:ring-black`}
                  minLength={5}
                  disabled={isLoading || registrationInProgress}
                />
              </div>
              <PasswordStrengthMeter password={registerPassword} />
              <p className="text-xs text-gray-500">Password must be at least 5 characters</p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-black block">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    clearErrors();
                  }}
                  onFocus={handlePasswordInputFocus}
                  className="bg-white border-2 border-gray-300 text-black pl-10 placeholder:text-gray-400 focus:border-black focus:ring-black"
                  minLength={5}
                  disabled={isLoading || registrationInProgress}
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="bg-white text-black border-2 border-black w-full py-6 rounded-md flex gap-2 items-center justify-center font-medium hover:bg-black hover:text-white"
              disabled={isLoading || registrationInProgress}
            >
              {(isLoading || registrationInProgress) ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <LogIn size={18} />
              )}
              Create Account
            </Button>
          </form>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 text-sm text-gray-600 text-center space-y-4">
        <p>Need help? <a href="https://discord.gg/cZ7MfkNH" className="text-black hover:underline">Join Pirate Gaming Discord</a> for assistance.</p>
      </div>
    </div>
  );
};

export default LoginForm;
