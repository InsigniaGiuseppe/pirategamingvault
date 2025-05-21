
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/hooks/useAuth';
import { LogIn, User, Lock, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';

interface LoginFormProps {
  onLogin?: (email: string, password: string) => void;
}

const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [activeTab, setActiveTab] = useState('login');
  const [registrationInProgress, setRegistrationInProgress] = useState(false);
  const { login, register, isLoading } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    try {
      if (onLogin) {
        onLogin(email, password);
      } else {
        await login(email, password);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "An error occurred during login. Please try again."
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || registrationInProgress) return;
    
    try {
      // Mark registration as in progress to prevent double submissions
      setRegistrationInProgress(true);
      
      if (registerPassword !== confirmPassword) {
        toast({
          variant: "destructive",
          title: "Password Mismatch",
          description: "Passwords do not match. Please try again."
        });
        return;
      }
      
      // Validate inputs
      if (!registerUsername.trim()) {
        toast({
          variant: "destructive",
          title: "Invalid Username",
          description: "Please enter a valid username."
        });
        return;
      }
      
      if (!registerPassword || registerPassword.length < 5) {
        toast({
          variant: "destructive",
          title: "Password Too Short",
          description: "Password must be at least 5 characters long."
        });
        return;
      }
      
      console.log('Initiating registration for:', registerUsername);
      await register(registerUsername, registerPassword);
    } catch (error) {
      console.error('Registration error in component:', error);
      toast({
        variant: "destructive",
        title: "Registration Failed", 
        description: "An error occurred during registration. Please try again."
      });
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
      
      <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="login">Sign In</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
        
        <TabsContent value="login">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-black block">Username</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <Input
                  id="email"
                  type="text"
                  placeholder="Enter your username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white border-2 border-gray-300 text-black pl-10 placeholder:text-gray-400 focus:border-black focus:ring-black"
                  required
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
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white border-2 border-gray-300 text-black pl-10 placeholder:text-gray-400 focus:border-black focus:ring-black"
                  required
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
                  onChange={(e) => setRegisterUsername(e.target.value)}
                  className="bg-white border-2 border-gray-300 text-black pl-10 placeholder:text-gray-400 focus:border-black focus:ring-black"
                  required
                  disabled={isLoading || registrationInProgress}
                />
              </div>
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
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className="bg-white border-2 border-gray-300 text-black pl-10 placeholder:text-gray-400 focus:border-black focus:ring-black"
                  minLength={5}
                  required
                  disabled={isLoading || registrationInProgress}
                />
              </div>
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
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-white border-2 border-gray-300 text-black pl-10 placeholder:text-gray-400 focus:border-black focus:ring-black"
                  minLength={5}
                  required
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
