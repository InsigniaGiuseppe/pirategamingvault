
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Activity, BarChart3, Settings, Coins, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import AdminOverview from '@/components/AdminOverview';
import EnhancedUserTable from '@/components/EnhancedUserTable';
import OptimizedTransactionHistory from '@/components/OptimizedTransactionHistory';
import SimpleActivityLogViewer from '@/components/SimpleActivityLogViewer';
import AdminSettings from '@/components/AdminSettings';

const Admin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Check admin authentication
  useEffect(() => {
    const adminAuth = localStorage.getItem('admin_authenticated');
    if (!adminAuth || adminAuth !== 'true') {
      toast({
        title: "Access Denied",
        description: "Please log in as admin to access this page.",
        variant: "destructive",
      });
      navigate('/admin-login');
    }
  }, [navigate, toast]);

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated');
    toast({
      title: "Logged Out",
      description: "You have been logged out from admin panel.",
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">Pirate Gaming Platform</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <AdminOverview />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
            <EnhancedUserTable 
              users={[]} 
              onViewDetails={() => {}} 
              onAddCoins={() => {}} 
              onRemoveCoins={() => {}} 
              onRefresh={() => {}} 
            />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <OptimizedTransactionHistory />
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <SimpleActivityLogViewer />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <AdminSettings isOpen={false} onClose={() => {}} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
