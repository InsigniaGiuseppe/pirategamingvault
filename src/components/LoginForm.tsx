
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/hooks/useAuth';

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
    <div className="w-full max-w-md mx-auto p-6 bg-pirate-secondary/80 rounded-lg shadow-pirate backdrop-blur-sm border border-pirate-accent/30">
      <h2 className="text-2xl font-bold text-pirate-text mb-2 font-cinzel">Ahoy, Matey!</h2>
      <p className="text-pirate-text/80 mb-6">Boarding the ship...</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="text"
            placeholder="Username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-pirate-background border-pirate-accent/30 text-pirate-text placeholder:text-pirate-text/50"
          />
        </div>
        
        <div>
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-pirate-background border-pirate-accent/30 text-pirate-text placeholder:text-pirate-text/50"
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-pirate-action hover:bg-pirate-action/80 text-pirate-text font-semibold shadow-pirate border border-pirate-accent/50"
        >
          Set Sail
        </Button>
      </form>
      
      <div className="mt-6 text-sm text-pirate-text/70 text-center">
        <p>Don't have credentials? Go to Pirate Gaming Discord to request.</p>
      </div>
    </div>
  );
};

export default LoginForm;
