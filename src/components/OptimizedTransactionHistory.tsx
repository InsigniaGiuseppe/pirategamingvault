
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Search, Download, Filter, TrendingUp, TrendingDown, BadgeDollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { fetchTransactions, getUniqueUsernames, type Transaction, type TransactionStats } from '@/services/transactionService';
import { useToast } from '@/hooks/use-toast';

const OptimizedTransactionHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<TransactionStats>({ total: 0, totalEarn: 0, totalSpend: 0, netFlow: 0 });
  const [usernames, setUsernames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const { toast } = useToast();

  const PAGE_SIZE = 50;

  // Debounced search to prevent excessive API calls
  const debouncedSearch = useMemo(() => {
    const timeoutId = setTimeout(() => {
      loadTransactions(true);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, typeFilter, userFilter]);

  useEffect(() => {
    return debouncedSearch;
  }, [debouncedSearch]);

  // Load usernames for filter
  useEffect(() => {
    loadUsernames();
  }, []);

  const loadUsernames = async () => {
    try {
      const names = await getUniqueUsernames();
      setUsernames(names);
    } catch (error) {
      console.error('Failed to load usernames:', error);
    }
  };

  const loadTransactions = useCallback(async (reset = false) => {
    if (loading) return;

    setLoading(true);
    try {
      const offset = reset ? 0 : (currentPage - 1) * PAGE_SIZE;
      const result = await fetchTransactions({
        searchTerm,
        typeFilter,
        userFilter,
        limit: PAGE_SIZE,
        offset
      });

      if (reset) {
        setTransactions(result.transactions);
        setCurrentPage(1);
      } else {
        setTransactions(prev => [...prev, ...result.transactions]);
      }

      setStats(result.stats);
      setHasMore(result.hasMore);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, typeFilter, userFilter, loading, toast]);

  const handleNextPage = () => {
    if (hasMore && !loading) {
      setCurrentPage(prev => prev + 1);
      loadTransactions();
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      loadTransactions(true);
    }
  };

  const exportCSV = () => {
    const headers = ['Date', 'Username', 'Type', 'Amount', 'Description'];
    const csvData = transactions.map(tx => [
      format(new Date(tx.created_at), 'yyyy-MM-dd HH:mm:ss'),
      tx.username || 'Unknown',
      tx.type,
      tx.amount,
      tx.description || ''
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
        return <BadgeDollarSign className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Transaction History</CardTitle>
          <Button onClick={exportCSV} variant="outline" size="sm" disabled={transactions.length === 0}>
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
              <BadgeDollarSign className="h-4 w-4 text-purple-500" />
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
              {usernames.map(username => (
                <SelectItem key={username} value={username}>{username}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Transaction Table */}
        <ScrollArea className="h-[400px]">
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
              {loading && transactions.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  </TableRow>
                ))
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-mono text-sm">
                      {format(new Date(transaction.created_at), 'MMM dd, HH:mm:ss')}
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
                      {transaction.description || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
              {!loading && transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No transactions found matching your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
        
        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            Showing {transactions.length} transactions
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm font-medium px-3">
              Page {currentPage}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={!hasMore || loading}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OptimizedTransactionHistory;
