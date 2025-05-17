
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/hooks/useAuth';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-black/30 rounded-lg shadow-xl backdrop-blur-sm">
      <h2 className="text-2xl font-bold text-white mb-2">Ahoy, Matey!</h2>
      <p className="text-gray-300 mb-6">Boarding the ship...</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="text"
            placeholder="Username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-[#333] border-netflix-red/30 text-white placeholder:text-gray-400"
          />
        </div>
        
        <div>
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-[#333] border-netflix-red/30 text-white placeholder:text-gray-400"
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-netflix-red hover:bg-netflix-red/80 text-white font-semibold"
        >
          Set Sail
        </Button>
      </form>
      
      <div className="mt-6 text-sm text-gray-400 text-center">
        <p>Don't have credentials? Go to Pirate Gaming Discord to request.</p>
      </div>
    </div>
  );
};

export default LoginForm;
