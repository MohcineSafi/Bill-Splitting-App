
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Users, History, Calculator } from 'lucide-react';
import { ExpenseForm } from '@/components/ExpenseForm';
import { FriendsManager } from '@/components/FriendsManager';
import { ExpenseHistory } from '@/components/ExpenseHistory';
import { BalanceCalculator } from '@/components/BalanceCalculator';

export interface Friend {
  id: string;
  name: string;
  email: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  date: string;
  splits: { [friendId: string]: number };
  category: string;
}

const Index = () => {
  const [friends, setFriends] = useState<Friend[]>([
    { id: '1', name: 'You', email: 'you@example.com' },
  ]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [activeTab, setActiveTab] = useState('expenses');

  const addFriend = (friend: Omit<Friend, 'id'>) => {
    const newFriend = {
      ...friend,
      id: Date.now().toString(),
    };
    setFriends([...friends, newFriend]);
  };

  const removeFriend = (friendId: string) => {
    if (friendId === '1') return; // Can't remove yourself
    setFriends(friends.filter(f => f.id !== friendId));
    // Remove friend from existing expenses
    setExpenses(expenses.map(expense => {
      const { [friendId]: removed, ...remainingSplits } = expense.splits;
      return { ...expense, splits: remainingSplits };
    }));
  };

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = {
      ...expense,
      id: Date.now().toString(),
    };
    setExpenses([newExpense, ...expenses]);
  };

  const deleteExpense = (expenseId: string) => {
    setExpenses(expenses.filter(e => e.id !== expenseId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">SplitEasy</h1>
          <p className="text-gray-600">Split expenses with friends effortlessly</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="expenses" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Expenses
            </TabsTrigger>
            <TabsTrigger value="friends" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Friends
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="balances" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Balances
            </TabsTrigger>
          </TabsList>

          <TabsContent value="expenses">
            <Card>
              <CardHeader>
                <CardTitle>Add New Expense</CardTitle>
              </CardHeader>
              <CardContent>
                <ExpenseForm friends={friends} onAddExpense={addExpense} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="friends">
            <Card>
              <CardHeader>
                <CardTitle>Manage Friends</CardTitle>
              </CardHeader>
              <CardContent>
                <FriendsManager 
                  friends={friends} 
                  onAddFriend={addFriend} 
                  onRemoveFriend={removeFriend} 
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Expense History</CardTitle>
              </CardHeader>
              <CardContent>
                <ExpenseHistory 
                  expenses={expenses} 
                  friends={friends} 
                  onDeleteExpense={deleteExpense} 
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="balances">
            <Card>
              <CardHeader>
                <CardTitle>Balances & Settlements</CardTitle>
              </CardHeader>
              <CardContent>
                <BalanceCalculator expenses={expenses} friends={friends} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
