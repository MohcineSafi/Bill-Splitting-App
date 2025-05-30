
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Friend, Expense } from '@/pages/Index';
import { TrendingUp, TrendingDown, DollarSign, ArrowRightLeft } from 'lucide-react';

interface BalanceCalculatorProps {
  expenses: Expense[];
  friends: Friend[];
}

interface Balance {
  friendId: string;
  balance: number; // positive means they are owed money, negative means they owe money
}

interface Settlement {
  from: string;
  to: string;
  amount: number;
}

export const BalanceCalculator = ({ expenses, friends }: BalanceCalculatorProps) => {
  const getFriendName = (friendId: string) => {
    const friend = friends.find(f => f.id === friendId);
    return friend ? friend.name : 'Unknown';
  };

  const calculateBalances = (): Balance[] => {
    const balances: { [friendId: string]: number } = {};
    
    // Initialize balances
    friends.forEach(friend => {
      balances[friend.id] = 0;
    });

    // Calculate balances from expenses
    expenses.forEach(expense => {
      // The person who paid gets credited
      balances[expense.paidBy] += expense.amount;
      
      // Everyone gets debited for their share
      Object.entries(expense.splits).forEach(([friendId, amount]) => {
        balances[friendId] -= amount;
      });
    });

    return Object.entries(balances).map(([friendId, balance]) => ({
      friendId,
      balance,
    }));
  };

  const calculateSettlements = (balances: Balance[]): Settlement[] => {
    const settlements: Settlement[] = [];
    const creditors = balances.filter(b => b.balance > 0.01).sort((a, b) => b.balance - a.balance);
    const debtors = balances.filter(b => b.balance < -0.01).sort((a, b) => a.balance - b.balance);
    
    let i = 0, j = 0;
    
    while (i < creditors.length && j < debtors.length) {
      const creditor = creditors[i];
      const debtor = debtors[j];
      
      const amount = Math.min(creditor.balance, -debtor.balance);
      
      if (amount > 0.01) {
        settlements.push({
          from: debtor.friendId,
          to: creditor.friendId,
          amount,
        });
        
        creditor.balance -= amount;
        debtor.balance += amount;
      }
      
      if (creditor.balance < 0.01) i++;
      if (debtor.balance > -0.01) j++;
    }
    
    return settlements;
  };

  const balances = calculateBalances();
  const settlements = calculateSettlements([...balances]);

  if (expenses.length === 0) {
    return (
      <div className="text-center py-8">
        <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">No expenses to calculate</h3>
        <p className="text-gray-500">Add some expenses to see balances and settlements!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Individual Balances */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Individual Balances</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {balances.map((balance) => (
            <Card key={balance.friendId} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      balance.balance > 0.01 ? 'bg-green-100' : 
                      balance.balance < -0.01 ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                      {balance.balance > 0.01 ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : balance.balance < -0.01 ? (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      ) : (
                        <DollarSign className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{getFriendName(balance.friendId)}</h4>
                      <p className="text-sm text-gray-600">
                        {balance.balance > 0.01 ? 'Is owed' : 
                         balance.balance < -0.01 ? 'Owes' : 'Settled up'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${
                      balance.balance > 0.01 ? 'text-green-600' : 
                      balance.balance < -0.01 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      ${Math.abs(balance.balance).toFixed(2)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Settlement Suggestions */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Settlement Suggestions</h3>
        {settlements.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-green-600 mb-2">
                <DollarSign className="w-8 h-8 mx-auto" />
              </div>
              <h4 className="font-medium text-green-700">Everyone is settled up!</h4>
              <p className="text-gray-600 text-sm">No payments needed.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {settlements.map((settlement, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{getFriendName(settlement.from)}</Badge>
                        <ArrowRightLeft className="w-4 h-4 text-gray-400" />
                        <Badge variant="outline">{getFriendName(settlement.to)}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-600">
                        ${settlement.amount.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">suggested payment</div>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    {getFriendName(settlement.from)} should pay {getFriendName(settlement.to)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
