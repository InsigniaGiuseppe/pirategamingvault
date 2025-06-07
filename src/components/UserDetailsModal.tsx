
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Coins, Calendar, TrendingUp, TrendingDown, Plus, Minus, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface User {
  id: string;
  username: string;
  balance: number;
  created_at: string;
  transactions?: any[];
  source: 'profiles' | 'custom_users';
}

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUpdateBalance: (userId: string, amount: number, description: string, action: 'add' | 'remove') => void;
  operationLoading?: string | null;
}

const UserDetailsModal = ({ isOpen, onClose, user, onUpdateBalance, operationLoading }: UserDetailsModalProps) => {
  const [coinAmount, setCoinAmount] = useState(10);
  const [coinReason, setCoinReason] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setCoinAmount(10);
      setCoinReason('');
      setValidationError('');
    }
  }, [isOpen]);

  if (!user) return null;

  const totalEarned = user.transactions?.filter((tx: any) => tx.amount > 0).reduce((sum: number, tx: any) => sum + tx.amount, 0) || 0;
  const totalSpent = user.transactions?.filter((tx: any) => tx.amount < 0).reduce((sum: number, tx: any) => sum + Math.abs(tx.amount), 0) || 0;
  const transactionCount = user.transactions?.length || 0;

  const validateForm = () => {
    if (!coinReason.trim()) {
      setValidationError('Please provide a reason for this operation');
      return false;
    }
    if (coinAmount <= 0 || isNaN(coinAmount)) {
      setValidationError('Please enter a valid positive amount');
      return false;
    }
    if (coinAmount > 10000) {
      setValidationError('Amount cannot exceed 10,000 coins');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleQuickAction = (action: 'add' | 'remove') => {
    if (!validateForm()) return;
    
    const confirmMessage = `Are you sure you want to ${action === 'add' ? 'add' : 'remove'} ${coinAmount} coins ${action === 'add' ? 'to' : 'from'} ${user.username}'s balance?\n\nReason: ${coinReason}`;
    
    if (!confirm(confirmMessage)) return;
    
    onUpdateBalance(user.id, coinAmount, coinReason, action);
  };

  const isOperationLoading = (operationType: string) => {
    return operationLoading === `${operationType}-${user.id}`;
  };

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'earn':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'spend':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'admin':
        return <Coins className="h-4 w-4 text-blue-500" />;
      default:
        return <Coins className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>User Details: {user.username}</span>
            <Badge variant="outline">ID: {user.id?.slice(0, 8)}...</Badge>
            <Badge 
              variant={user.source === 'profiles' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {user.source === 'profiles' ? 'Auth User' : 'Custom User'}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Comprehensive account overview and management tools
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="actions">Admin Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-600">Current Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-1">
                    <Coins className="h-5 w-5 text-yellow-500" />
                    <span className="text-2xl font-bold">{user.balance}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-600">Total Earned</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <span className="text-2xl font-bold text-green-600">{totalEarned}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-600">Total Spent</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-1">
                    <TrendingDown className="h-5 w-5 text-red-500" />
                    <span className="text-2xl font-bold text-red-600">{totalSpent}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-600">Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    <span className="text-2xl font-bold">{transactionCount}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Username:</span> {user.username}
                  </div>
                  <div>
                    <span className="font-medium">User ID:</span> {user.id}
                  </div>
                  <div>
                    <span className="font-medium">Account Type:</span> 
                    <Badge 
                      variant={user.source === 'profiles' ? 'default' : 'secondary'}
                      className="ml-2 text-xs"
                    >
                      {user.source === 'profiles' ? 'Auth User' : 'Custom User'}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Registered:</span> {user.created_at ? format(new Date(user.created_at), 'PPP') : 'Unknown'}
                  </div>
                  <div>
                    <span className="font-medium">Net Activity:</span> 
                    <span className={`ml-2 font-bold ${(totalEarned - totalSpent) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {totalEarned - totalSpent >= 0 ? '+' : ''}{totalEarned - totalSpent}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History ({transactionCount} total)</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {user.transactions && user.transactions.length > 0 ? (
                    <div className="space-y-2">
                      {user.transactions.map((transaction: any) => (
                        <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {getTransactionTypeIcon(transaction.type)}
                            <div>
                              <p className="font-medium text-sm">{transaction.description}</p>
                              <p className="text-xs text-gray-500">
                                {format(new Date(transaction.created_at), 'PPp')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={transaction.type === 'earn' ? 'default' : transaction.type === 'spend' ? 'destructive' : 'secondary'}>
                              {transaction.type}
                            </Badge>
                            <span className={`font-bold ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.amount >= 0 ? '+' : ''}{transaction.amount}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No transactions found</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions">
            <Card>
              <CardHeader>
                <CardTitle>Admin Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="coin-amount">Amount</Label>
                    <Input
                      id="coin-amount"
                      type="number"
                      value={coinAmount}
                      onChange={(e) => {
                        setCoinAmount(parseInt(e.target.value) || 0);
                        setValidationError('');
                      }}
                      min="1"
                      max="10000"
                      placeholder="Enter amount"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="coin-reason">Reason *</Label>
                    <Input
                      id="coin-reason"
                      value={coinReason}
                      onChange={(e) => {
                        setCoinReason(e.target.value);
                        setValidationError('');
                      }}
                      placeholder="Enter reason for balance change"
                      maxLength={200}
                    />
                  </div>

                  {validationError && (
                    <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      {validationError}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleQuickAction('add')}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      disabled={isOperationLoading('add') || isOperationLoading('remove')}
                    >
                      {isOperationLoading('add') ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      Add {coinAmount} Coins
                    </Button>
                    <Button 
                      onClick={() => handleQuickAction('remove')}
                      className="flex-1 bg-orange-600 hover:bg-orange-700"
                      disabled={isOperationLoading('add') || isOperationLoading('remove')}
                    >
                      {isOperationLoading('remove') ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Minus className="h-4 w-4 mr-2" />
                      )}
                      Remove {coinAmount} Coins
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsModal;
