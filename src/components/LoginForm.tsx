
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
    <div className="w-full max-w-md mx-auto p-6 bg-[#0c1f2c]/80 rounded-lg shadow-xl backdrop-blur-sm border border-[#cfb53b]/30">
      <h2 className="text-2xl font-bold text-[#cde8e5] mb-2">Ahoy, Matey!</h2>
      <p className="text-[#cde8e5]/80 mb-6">Boarding the ship...</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="text"
            placeholder="Username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-[#3b2f2f] border-[#cfb53b]/30 text-[#cde8e5] placeholder:text-[#cde8e5]/50"
          />
        </div>
        
        <div>
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-[#3b2f2f] border-[#cfb53b]/30 text-[#cde8e5] placeholder:text-[#cde8e5]/50"
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-[#8b0000] hover:bg-[#8b0000]/80 text-white font-semibold shadow-md"
        >
          Set Sail
        </Button>
      </form>
      
      <div className="mt-6 text-sm text-[#cde8e5]/70 text-center">
        <p>Don't have credentials? Go to Pirate Gaming Discord to request.</p>
      </div>
    </div>
  );
};

export default LoginForm;
