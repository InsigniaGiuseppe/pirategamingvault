
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/hooks/useAuth';
import { LogIn } from 'lucide-react';

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
    <div className="w-full max-w-md mx-auto p-6 glass-panel">
      <h2 className="text-2xl font-bold text-digital-primary mb-2 font-space">Welcome Explorer</h2>
      <p className="text-digital-muted mb-6">Enter your credentials</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="text"
            placeholder="Username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-digital-background/40 border-digital-primary/20 text-digital-text placeholder:text-digital-muted/70 focus:border-digital-primary focus:ring-digital-primary"
            required
          />
        </div>
        
        <div>
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-digital-background/40 border-digital-primary/20 text-digital-text placeholder:text-digital-muted/70 focus:border-digital-primary focus:ring-digital-primary"
            required
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full primary-button font-space flex gap-2 items-center justify-center py-5 rounded-md text-black"
        >
          <LogIn size={18} />
          ACCESS SYSTEM
        </Button>
      </form>
      
      <div className="mt-6 text-sm text-digital-muted text-center">
        <p>No credentials? Join Pirate Gaming Discord for access.</p>
      </div>
    </div>
  );
};

export default LoginForm;
