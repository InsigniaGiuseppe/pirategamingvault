
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Download, Filter, Calendar, Coins, TrendingUp, TrendingDown, BadgeDollarSign } from 'lucide-react';
import { format } from 'date-fns';

interface Transaction {
  id: string;
  timestamp: number;
  amount: number;
  description: string;
  type: 'earn' | 'spend' | 'admin';
  username?: string;
}

interface EnhancedTransactionHistoryProps {
  transactions: Transaction[];
  databaseUsers: any[];
}

const EnhancedTransactionHistory = ({ transactions, databaseUsers }: EnhancedTransactionHistoryProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'user'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Combine transactions from both credential users and database users
  const allTransactions = useMemo(() => {
    const combined: Transaction[] = [...transactions];
    
    // Add database user transactions
    databaseUsers.forEach(user => {
      if (user.transactions) {
        user.transactions.forEach((tx: any) => {
          combined.push({
            ...tx,
            username: user.username
          });
        });
      }
    });
    
    return combined;
  }, [transactions, databaseUsers]);

  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = allTransactions.filter(tx => {
      const matchesSearch = !searchTerm || 
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.username && tx.username.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = typeFilter === 'all' || tx.type === typeFilter;
      const matchesUser = userFilter === 'all' || tx.username === userFilter;
      
      return matchesSearch && matchesType && matchesUser;
    });
    
    // Sort transactions
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = a.timestamp - b.timestamp;
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'user':
          comparison = (a.username || '').localeCompare(b.username || '');
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
    
    return filtered;
  }, [allTransactions, searchTerm, typeFilter, userFilter, sortBy, sortOrder]);

  const stats = useMemo(() => {
    const totalEarn = filteredAndSortedTransactions
      .filter(tx => tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const totalSpend = Math.abs(filteredAndSortedTransactions
      .filter(tx => tx.amount < 0)
      .reduce((sum, tx) => sum + tx.amount, 0));
    
    return {
      total: filteredAndSortedTransactions.length,
      totalEarn,
      totalSpend,
      netFlow: totalEarn - totalSpend
    };
  }, [filteredAndSortedTransactions]);

  const exportCSV = () => {
    const headers = ['Date', 'Username', 'Type', 'Amount', 'Description'];
    const csvData = filteredAndSortedTransactions.map(tx => [
      format(new Date(tx.timestamp), 'yyyy-MM-dd HH:mm:ss'),
      tx.username || 'Unknown',
      tx.type,
      tx.amount,
      tx.description
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earn':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'spend':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'admin':
        return <BadgeDollarSign className="h-4 w-4 text-blue-500" />;
      default:
        return <Coins className="h-4 w-4 text-gray-500" />;
    }
  };

  const uniqueUsernames = Array.from(new Set(allTransactions.map(tx => tx.username).filter(Boolean)));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Enhanced Transaction History</CardTitle>
          <Button onClick={exportCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Total</span>
            </div>
            <p className="text-xl font-bold text-blue-700">{stats.total}</p>
          </div>
          
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Earned</span>
            </div>
            <p className="text-xl font-bold text-green-700">+{stats.totalEarn}</p>
          </div>
          
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Spent</span>
            </div>
            <p className="text-xl font-bold text-red-700">-{stats.totalSpend}</p>
          </div>
          
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Net Flow</span>
            </div>
            <p className={`text-xl font-bold ${stats.netFlow >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {stats.netFlow >= 0 ? '+' : ''}{stats.netFlow}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search transactions or users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="earn">Earn</SelectItem>
              <SelectItem value="spend">Spend</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="User" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {uniqueUsernames.map(username => (
                <SelectItem key={username} value={username!}>{username}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={(value: 'date' | 'amount' | 'user') => setSortBy(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="amount">Amount</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </Button>
        </div>
        
        {/* Transaction Table */}
        <ScrollArea className="h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-mono text-sm">
                    {format(new Date(transaction.timestamp), 'MMM dd, HH:mm:ss')}
                  </TableCell>
                  <TableCell className="font-medium">
                    {transaction.username || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTransactionIcon(transaction.type)}
                      <Badge 
                        variant={
                          transaction.type === 'earn' ? 'default' : 
                          transaction.type === 'spend' ? 'destructive' : 'secondary'
                        }
                      >
                        {transaction.type}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className={`font-bold ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.amount >= 0 ? '+' : ''}{transaction.amount}
                  </TableCell>
                  <TableCell className="max-w-xs truncate" title={transaction.description}>
                    {transaction.description}
                  </TableCell>
                </TableRow>
              ))}
              {filteredAndSortedTransactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No transactions found matching your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default EnhancedTransactionHistory;
