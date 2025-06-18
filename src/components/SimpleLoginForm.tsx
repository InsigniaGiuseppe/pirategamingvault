
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { LogIn, User, Lock, Loader2, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LoginFormProps {
  onLogin?: (username: string, password: string) => void;
}

const SimpleLoginForm = ({ onLogin }: LoginFormProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [activeTab, setActiveTab] = useState('login');
  const [formError, setFormError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  const { login, register, isLoading, error } = useSimpleAuth();

  const clearErrors = () => {
    setFormError(null);
    setRegistrationSuccess(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    
    if (!username.trim()) {
      setFormError('Please enter your username');
      return;
    }
    
    if (!password) {
      setFormError('Please enter your password');
      return;
    }
    
    try {
      console.log('🔐 Login form - Starting login for:', username);
      if (onLogin) {
        await onLogin(username, password);
      } else {
        await login(username, password);
      }
      console.log('🔐 Login form - Login completed');
    } catch (error) {
      console.error('🔐 Login form - Login error:', error);
      setFormError('Login failed. Please try again.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    
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
      console.log('🔐 Registration form - Starting registration for:', registerUsername);
      await register(registerUsername, registerPassword);
      console.log('🔐 Registration form - Registration completed');
      
      setRegistrationSuccess(true);
      setRegisterUsername('');
      setRegisterPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('🔐 Registration form - Registration error:', error);
      setFormError('Registration failed. Please try again.');
    }
  };

  // Show auth context error if it exists and no form error
  const displayError = formError || error;

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
      
      {registrationSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-600 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <span>Account created successfully! You should be automatically logged in.</span>
        </div>
      )}
      
      {displayError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <span>{displayError}</span>
        </div>
      )}
      
      {isLoading && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-600 flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>{activeTab === 'login' ? 'Signing in...' : 'Creating account...'}</span>
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
              className="bg-white text-black border-2 border-black w-full py-6 rounded-md flex gap-2 items-center justify-center font-medium hover:bg-black hover:text-white disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <LogIn size={18} />
              )}
              {isLoading ? 'Signing in...' : 'Sign in to your vault'}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="bg-white text-black border-2 border-black w-full py-6 rounded-md flex gap-2 items-center justify-center font-medium hover:bg-black hover:text-white disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <LogIn size={18} />
              )}
              {isLoading ? 'Creating Account...' : 'Create Account'}
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

export default SimpleLoginForm;
