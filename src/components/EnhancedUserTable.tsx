
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Search, Eye, Plus, Minus, Users, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

interface EnhancedUserTableProps {
  users: any[];
  onViewDetails: (user: any) => void;
  onAddCoins: (username: string, userId: string) => void;
  onRemoveCoins: (username: string, userId: string) => void;
  onRefresh: () => void;
}

const EnhancedUserTable = ({ users, onViewDetails, onAddCoins, onRemoveCoins, onRefresh }: EnhancedUserTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUsers = users.length;
  const totalBalance = users.reduce((sum, user) => sum + (user.balance || 0), 0);
  const totalTransactions = users.reduce((sum, user) => sum + (user.transactions?.length || 0), 0);
  const averageBalance = totalUsers > 0 ? Math.round(totalBalance / totalUsers) : 0;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{totalUsers}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
              <Coins className="h-4 w-4 text-yellow-500" />
              Total Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-yellow-600">{totalBalance}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              Avg Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-blue-600">{averageBalance}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-green-600">{totalTransactions}</span>
          </CardContent>
        </Card>
      </div>

      {/* User Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Registered Users ({filteredUsers.length})</CardTitle>
            <Button onClick={onRefresh} variant="outline">
              Refresh Data
            </Button>
          </div>
          
          {/* Search */}
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by username or user ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Transactions</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const earnedTotal = user.transactions?.filter((tx: any) => tx.amount > 0).reduce((sum: number, tx: any) => sum + tx.amount, 0) || 0;
                  const spentTotal = Math.abs(user.transactions?.filter((tx: any) => tx.amount < 0).reduce((sum: number, tx: any) => sum + tx.amount, 0) || 0);
                  const netActivity = earnedTotal - spentTotal;
                  
                  return (
                    <TableRow key={user.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>
                        <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {user.id.slice(0, 8)}...
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Coins size={16} className="text-yellow-500" />
                          <span className="font-bold">{user.balance}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">
                          {user.transactions?.length || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs space-y-1">
                          <div className="flex items-center gap-1">
                            <span className="text-green-600">+{earnedTotal}</span>
                            <span className="text-gray-400">|</span>
                            <span className="text-red-600">-{spentTotal}</span>
                          </div>
                          <div className={`font-medium ${netActivity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            Net: {netActivity >= 0 ? '+' : ''}{netActivity}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        {user.created_at ? format(new Date(user.created_at), 'MMM dd, yyyy') : 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            onClick={() => onViewDetails(user)}
                            variant="outline"
                            size="sm"
                            className="h-8 px-2"
                          >
                            <Eye size={14} className="mr-1" />
                            View
                          </Button>
                          <Button
                            onClick={() => onAddCoins(user.username, user.id)}
                            variant="outline"
                            size="sm"
                            className="h-8 px-2 border-green-300 text-green-600 hover:bg-green-50"
                          >
                            <Plus size={14} />
                          </Button>
                          <Button
                            onClick={() => onRemoveCoins(user.username, user.id)}
                            variant="outline"
                            size="sm"
                            className="h-8 px-2 border-orange-300 text-orange-600 hover:bg-orange-50"
                          >
                            <Minus size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      {searchTerm ? 'No users found matching your search.' : 'No registered users found.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedUserTable;
