
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
        <div className="flex justify-center mb-4">
          <img 
            src="/lovable-uploads/e658c565-6755-4834-9495-f23f5cbac18c.png" 
            alt="Pirate Gaming Logo" 
            className="h-16"
            style={{ filter: 'brightness(0)' }}
          />
        </div>
        <h2 className="text-2xl font-bold text-black mb-2 font-heading">Welcome to the PIRATE VAULT</h2>
        <p className="text-gray-600">Enter your credentials to access your vault</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
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
            />
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="bg-white text-black border-2 border-black w-full py-6 rounded-md flex gap-2 items-center justify-center font-medium hover:bg-black hover:text-white"
        >
          <LogIn size={18} />
          Sign in to your vault
        </Button>
      </form>
      
      <div className="mt-8 text-sm text-gray-600 text-center">
        <p>No credentials? <a href="https://discord.gg/cZ7MfkNH" className="text-black hover:underline">Join Pirate Gaming Discord</a> and ask GIUSEPPE for access.</p>
      </div>
    </div>
  );
};

export default LoginForm;
