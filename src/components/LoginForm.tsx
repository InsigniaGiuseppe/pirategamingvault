
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/hooks/useAuth';
import { LogIn, User, Lock, Loader2, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';

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
  const { login, register, isLoading } = useAuth();
  const { toast } = useToast();

  const clearErrors = () => {
    setFormError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    
    if (isLoading) return;
    
    // Basic validation
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
        // Using the external login handler provided by parent
        onLogin(username, password);
      } else {
        // Using the auth context login directly
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
    
    if (isLoading || registrationInProgress) return;
    
    // Input validation - clear and detailed errors
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
      // Mark registration as in progress to prevent double submissions
      setRegistrationInProgress(true);
      
      console.log('Initiating registration for:', registerUsername);
      await register(registerUsername, registerPassword);
    } catch (error) {
      console.error('Registration error in component:', error);
      setFormError('An error occurred during registration. Please try again.');
    } finally {
      setRegistrationInProgress(false);
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
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <span>{formError}</span>
        </div>
      )}
      
      <Tabs defaultValue="login" value={activeTab} onValueChange={(val) => {
        setActiveTab(val);
        clearErrors();
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
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="bg-white text-black border-2 border-black w-full py-6 rounded-md flex gap-2 items-center justify-center font-medium hover:bg-black hover:text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <LogIn size={18} />
              )}
              Sign in to your vault
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
            
            <div className="space-y-2">
              <label htmlFor="registerPassword" className="text-sm font-medium text-black block">Password</label>
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
                  className="bg-white border-2 border-gray-300 text-black pl-10 placeholder:text-gray-400 focus:border-black focus:ring-black"
                  minLength={5}
                  disabled={isLoading || registrationInProgress}
                />
              </div>
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
