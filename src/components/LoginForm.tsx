
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
    <div className="w-full max-w-md mx-auto p-8 saas-panel-dark border border-saas-grey-800/20">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-saas-teal mb-2 font-heading">Welcome to PIRATE GAMING</h2>
        <p className="text-saas-grey-400">Enter your credentials to access your vault</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-saas-white block">Username</label>
          <div className="relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-saas-grey-400" />
            <Input
              id="email"
              type="text"
              placeholder="Enter your username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-saas-navy/40 border-saas-grey-800/30 text-saas-white pl-10 placeholder:text-saas-grey-400 focus:border-saas-teal focus:ring-saas-teal"
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-saas-white flex justify-between items-center">
            <span>Password</span>
            <a href="#" className="text-saas-teal text-xs hover:underline">Forgot password?</a>
          </label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-saas-grey-400" />
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-saas-navy/40 border-saas-grey-800/30 text-saas-white pl-10 placeholder:text-saas-grey-400 focus:border-saas-teal focus:ring-saas-teal"
              required
            />
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="saas-button-primary w-full py-6 rounded-md text-saas-navy flex gap-2 items-center justify-center font-medium"
        >
          <LogIn size={18} />
          SIGN IN TO YOUR VAULT
        </Button>
      </form>
      
      <div className="mt-8 text-sm text-saas-grey-400 text-center">
        <p>No credentials? <a href="https://discord.gg/cZ7MfkNH" className="text-saas-teal hover:underline">Join Pirate Gaming Discord</a> for access.</p>
      </div>
    </div>
  );
};

export default LoginForm;
