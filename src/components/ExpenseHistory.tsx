
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Friend, Expense } from '@/pages/Index';
import { Trash2, Calendar, DollarSign, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExpenseHistoryProps {
  expenses: Expense[];
  friends: Friend[];
  onDeleteExpense: (expenseId: string) => void;
}

export const ExpenseHistory = ({ expenses, friends, onDeleteExpense }: ExpenseHistoryProps) => {
  const { toast } = useToast();

  const getFriendName = (friendId: string) => {
    const friend = friends.find(f => f.id === friendId);
    return friend ? friend.name : 'Unknown';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      food: 'bg-orange-100 text-orange-800',
      transportation: 'bg-blue-100 text-blue-800',
      entertainment: 'bg-purple-100 text-purple-800',
      shopping: 'bg-green-100 text-green-800',
      utilities: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors.other;
  };

  const handleDelete = (expense: Expense) => {
    onDeleteExpense(expense.id);
    toast({
      title: "Expense Deleted",
      description: `"${expense.description}" has been removed.`,
    });
  };

  if (expenses.length === 0) {
    return (
      <div className="text-center py-8">
        <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">No expenses yet</h3>
        <p className="text-gray-500">Add your first expense to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {expenses.map((expense) => (
        <Card key={expense.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg">{expense.description}</h3>
                  <Badge className={getCategoryColor(expense.category)}>
                    {expense.category}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-medium">${expense.amount.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>Paid by {getFriendName(expense.paidBy)}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(expense.date)}</span>
                  </div>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(expense)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Split Details:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(expense.splits).map(([friendId, amount]) => (
                  <div key={friendId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">{getFriendName(friendId)}</span>
                    <span className="font-medium">${amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
