
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Shield, User, Lock } from 'lucide-react';
import { verifyCredentials } from '@/services/credentialService';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const credential = verifyCredentials(username, password);
      
      if (credential && (credential.username === 'Dannehsbum' || credential.username === 'GIUSEPPE')) {
        // Admin login successful
        localStorage.setItem('pirateAdminLoggedIn', 'true');
        toast({
          title: 'Login successful',
          description: 'Welcome to the admin dashboard.',
        });
        navigate('/admin');
      } else {
        toast({
          variant: 'destructive',
          title: 'Login failed',
          description: 'Invalid admin credentials.',
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-md bg-white rounded-xl p-8 shadow-saas">
        <div className="text-center mb-6">
          <div className="bg-gray-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-2xl font-bold text-black font-heading">ADMIN LOGIN</h1>
          <p className="text-gray-600 mt-2">Access the credential management system</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium text-black block">Username</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <Input
                id="username"
                type="text"
                placeholder="Admin username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-white border-2 border-gray-300 text-black pl-10 placeholder:text-gray-400 focus:border-black focus:ring-black"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-black block">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <Input
                id="password"
                type="password"
                placeholder="Admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white border-2 border-gray-300 text-black pl-10 placeholder:text-gray-400 focus:border-black focus:ring-black"
                required
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="bg-white text-black border-2 border-black w-full py-6 font-medium hover:bg-black hover:text-white"
            disabled={isLoading}
          >
            {isLoading ? 'Authenticating...' : 'Access Admin Panel'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
