
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Friend, Expense } from '@/pages/Index';
import { useToast } from '@/hooks/use-toast';

interface ExpenseFormProps {
  friends: Friend[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
}

export const ExpenseForm = ({ friends, onAddExpense }: ExpenseFormProps) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [category, setCategory] = useState('');
  const [splitMethod, setSplitMethod] = useState<'equal' | 'custom'>('equal');
  const [customSplits, setCustomSplits] = useState<{ [friendId: string]: string }>({});
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description || !amount || !paidBy || !category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    let splits: { [friendId: string]: number } = {};

    if (splitMethod === 'equal') {
      const splitAmount = numAmount / friends.length;
      friends.forEach(friend => {
        splits[friend.id] = splitAmount;
      });
    } else {
      let totalCustom = 0;
      friends.forEach(friend => {
        const customAmount = parseFloat(customSplits[friend.id] || '0');
        splits[friend.id] = customAmount;
        totalCustom += customAmount;
      });

      if (Math.abs(totalCustom - numAmount) > 0.01) {
        toast({
          title: "Split Doesn't Match",
          description: `Custom splits (${totalCustom.toFixed(2)}) don't equal the total amount (${numAmount.toFixed(2)}).`,
          variant: "destructive",
        });
        return;
      }
    }

    const expense: Omit<Expense, 'id'> = {
      description,
      amount: numAmount,
      paidBy,
      date: new Date().toISOString(),
      splits,
      category,
    };

    onAddExpense(expense);

    // Reset form
    setDescription('');
    setAmount('');
    setPaidBy('');
    setCategory('');
    setSplitMethod('equal');
    setCustomSplits({});

    toast({
      title: "Expense Added",
      description: "Your expense has been added successfully.",
    });
  };

  const handleCustomSplitChange = (friendId: string, value: string) => {
    setCustomSplits(prev => ({
      ...prev,
      [friendId]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Dinner at restaurant"
            required
          />
        </div>

        <div>
          <Label htmlFor="amount">Amount ($)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>

        <div>
          <Label htmlFor="paidBy">Paid By</Label>
          <Select value={paidBy} onValueChange={setPaidBy} required>
            <SelectTrigger>
              <SelectValue placeholder="Select who paid" />
            </SelectTrigger>
            <SelectContent>
              {friends.map((friend) => (
                <SelectItem key={friend.id} value={friend.id}>
                  {friend.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory} required>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="food">Food & Dining</SelectItem>
              <SelectItem value="transportation">Transportation</SelectItem>
              <SelectItem value="entertainment">Entertainment</SelectItem>
              <SelectItem value="shopping">Shopping</SelectItem>
              <SelectItem value="utilities">Utilities</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Split Method</Label>
        <div className="flex gap-4 mt-2">
          <Button
            type="button"
            variant={splitMethod === 'equal' ? 'default' : 'outline'}
            onClick={() => setSplitMethod('equal')}
          >
            Split Equally
          </Button>
          <Button
            type="button"
            variant={splitMethod === 'custom' ? 'default' : 'outline'}
            onClick={() => setSplitMethod('custom')}
          >
            Custom Split
          </Button>
        </div>
      </div>

      {splitMethod === 'custom' && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Custom Split Amounts</h4>
              {friends.map((friend) => (
                <div key={friend.id} className="flex items-center gap-4">
                  <Label className="min-w-0 flex-1">{friend.name}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={customSplits[friend.id] || ''}
                    onChange={(e) => handleCustomSplitChange(friend.id, e.target.value)}
                    placeholder="0.00"
                    className="w-24"
                  />
                </div>
              ))}
              <div className="text-sm text-gray-600">
                Total: ${Object.values(customSplits).reduce((sum, val) => sum + (parseFloat(val) || 0), 0).toFixed(2)}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Button type="submit" className="w-full">
        Add Expense
      </Button>
    </form>
  );
};
