
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/hooks/useAuth';
import { LogIn, User, Lock } from 'lucide-react';

interface LoginFormProps {
  onLogin?: (email: string, password: string) => void;
}

const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onLogin) {
      onLogin(email, password);
    } else {
      login(email, password);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white rounded-xl shadow-saas">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-saas-text-headline mb-2 font-heading">Welcome to PIRATE GAMING</h2>
        <p className="text-saas-text-body">Enter your credentials to access your vault</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-saas-text-headline block">Username</label>
          <div className="relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-saas-grey-500" />
            <Input
              id="email"
              type="text"
              placeholder="Enter your username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white border-saas-grey-200 text-saas-text-body pl-10 placeholder:text-saas-grey-400 focus:border-saas-teal focus:ring-saas-teal"
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-saas-text-headline flex justify-between items-center">
            <span>Password</span>
            <a href="#" className="text-saas-teal text-xs hover:underline">Forgot password?</a>
          </label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-saas-grey-500" />
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white border-saas-grey-200 text-saas-text-body pl-10 placeholder:text-saas-grey-400 focus:border-saas-teal focus:ring-saas-teal"
              required
            />
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="bg-saas-teal text-white w-full py-6 rounded-md flex gap-2 items-center justify-center font-medium shadow-saas-primary hover:shadow-saas-hover"
        >
          <LogIn size={18} />
          SIGN IN TO YOUR VAULT
        </Button>
      </form>
      
      <div className="mt-8 text-sm text-saas-text-body text-center">
        <p>No credentials? <a href="https://discord.gg/cZ7MfkNH" className="text-saas-teal hover:underline">Join Pirate Gaming Discord</a> for access.</p>
      </div>
    </div>
  );
};

export default LoginForm;
