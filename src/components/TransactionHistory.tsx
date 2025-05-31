
import { useAuth } from "@/hooks/useSimpleAuth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownRight, BadgeDollarSign } from "lucide-react";
import PirateCoinsDisplay from "@/components/PirateCoinsDisplay";

const TransactionHistory = () => {
  const { transactions } = useAuth();

  const sortedTransactions = [...transactions].sort((a, b) => b.timestamp - a.timestamp);
  
  const formatAmount = (amount: number): string => {
    return amount > 0 ? `+${amount}` : `${amount}`;
  };
  
  const getTransactionDetails = (type: "earn" | "spend" | "admin") => {
    switch(type) {
      case "earn":
        return { 
          icon: <ArrowUpRight className="h-4 w-4 text-green-500" />,
          bgColor: "bg-green-50",
          textColor: "text-green-700"
        };
      case "spend":
        return { 
          icon: <ArrowDownRight className="h-4 w-4 text-red-500" />,
          bgColor: "bg-red-50",
          textColor: "text-red-700"
        };
      case "admin":
        return { 
          icon: <BadgeDollarSign className="h-4 w-4 text-blue-500" />,
          bgColor: "bg-blue-50",
          textColor: "text-blue-700"
        };
      default:
        return { 
          icon: <BadgeDollarSign className="h-4 w-4 text-gray-500" />,
          bgColor: "bg-gray-50",
          textColor: "text-gray-700"
        };
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-saas border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Transaction History</h2>
        <PirateCoinsDisplay size="large" />
      </div>

      {sortedTransactions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No transactions yet</p>
        </div>
      ) : (
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {sortedTransactions.map((transaction) => {
              const { icon, bgColor, textColor } = getTransactionDetails(transaction.type);
              return (
                <div 
                  key={transaction.id} 
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${bgColor}`}>
                      {icon}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{transaction.description}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(transaction.timestamp), 'MMM d, yyyy • h:mm a')}
                      </p>
                    </div>
                  </div>
                  <div className={`font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatAmount(transaction.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default TransactionHistory;
