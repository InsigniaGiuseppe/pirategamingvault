
import { supabase } from '@/integrations/supabase/client';

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  description?: string;
  type: string;
  created_at: string;
  username?: string;
}

export interface TransactionFilters {
  searchTerm?: string;
  typeFilter?: string;
  userFilter?: string;
  limit?: number;
  offset?: number;
}

export interface TransactionStats {
  total: number;
  totalEarn: number;
  totalSpend: number;
  netFlow: number;
}

// Fetch transactions with pagination and filtering
export const fetchTransactions = async (filters: TransactionFilters = {}): Promise<{
  transactions: Transaction[];
  stats: TransactionStats;
  hasMore: boolean;
}> => {
  try {
    const {
      searchTerm = '',
      typeFilter = 'all',
      userFilter = 'all',
      limit = 50,
      offset = 0
    } = filters;

    // Build query for transactions
    let query = supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (typeFilter !== 'all') {
      query = query.eq('type', typeFilter);
    }

    if (searchTerm) {
      query = query.ilike('description', `%${searchTerm}%`);
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: transactionsData, error: transactionsError } = await query;

    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError);
      return {
        transactions: [],
        stats: { total: 0, totalEarn: 0, totalSpend: 0, netFlow: 0 },
        hasMore: false
      };
    }

    // Fetch usernames separately to avoid join issues
    const [profilesResult, customUsersResult] = await Promise.all([
      supabase.from('profiles').select('id, username'),
      supabase.from('custom_users').select('id, username')
    ]);

    const profiles = profilesResult.data || [];
    const customUsers = customUsersResult.data || [];

    // Transform data and add usernames
    const transactions: Transaction[] = (transactionsData || []).map(tx => {
      const profileUser = profiles.find(p => p.id === tx.user_id);
      const customUser = customUsers.find(u => u.id === tx.user_id);
      
      return {
        id: tx.id,
        user_id: tx.user_id,
        amount: tx.amount,
        description: tx.description,
        type: tx.type,
        created_at: tx.created_at,
        username: profileUser?.username || customUser?.username || 'Unknown'
      };
    });

    // Apply user filter after username resolution
    const filteredTransactions = userFilter !== 'all' 
      ? transactions.filter(tx => tx.username === userFilter)
      : transactions;

    // Apply search filter on username if needed
    const finalTransactions = searchTerm && !filteredTransactions.some(tx => 
      tx.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ) 
      ? filteredTransactions.filter(tx => 
          tx.username?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : filteredTransactions;

    // Calculate stats
    const stats = calculateStats(finalTransactions);
    const hasMore = (count || 0) > offset + limit;

    return { transactions: finalTransactions, stats, hasMore };
  } catch (error) {
    console.error('Unexpected error in fetchTransactions:', error);
    return {
      transactions: [],
      stats: { total: 0, totalEarn: 0, totalSpend: 0, netFlow: 0 },
      hasMore: false
    };
  }
};

// Calculate transaction statistics
const calculateStats = (transactions: Transaction[]): TransactionStats => {
  const totalEarn = transactions
    .filter(tx => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  const totalSpend = Math.abs(transactions
    .filter(tx => tx.amount < 0)
    .reduce((sum, tx) => sum + tx.amount, 0));
  
  return {
    total: transactions.length,
    totalEarn,
    totalSpend,
    netFlow: totalEarn - totalSpend
  };
};

// Get unique usernames for filter dropdown
export const getUniqueUsernames = async (): Promise<string[]> => {
  try {
    const [profilesResult, customUsersResult] = await Promise.all([
      supabase.from('profiles').select('username'),
      supabase.from('custom_users').select('username')
    ]);

    const profiles = profilesResult.data || [];
    const customUsers = customUsersResult.data || [];
    
    const allUsernames = [
      ...profiles.map(p => p.username),
      ...customUsers.map(u => u.username)
    ];
    
    return Array.from(new Set(allUsernames)).filter(Boolean);
  } catch (error) {
    console.error('Error fetching usernames:', error);
    return [];
  }
};
