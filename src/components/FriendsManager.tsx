
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Friend } from '@/pages/Index';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Trash2 } from 'lucide-react';

interface FriendsManagerProps {
  friends: Friend[];
  onAddFriend: (friend: Omit<Friend, 'id'>) => void;
  onRemoveFriend: (friendId: string) => void;
}

export const FriendsManager = ({ friends, onAddFriend, onRemoveFriend }: FriendsManagerProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email) {
      toast({
        title: "Missing Information",
        description: "Please fill in both name and email.",
        variant: "destructive",
      });
      return;
    }

    // Check if friend already exists
    if (friends.some(friend => friend.email === email)) {
      toast({
        title: "Friend Already Exists",
        description: "A friend with this email already exists.",
        variant: "destructive",
      });
      return;
    }

    onAddFriend({ name, email });
    setName('');
    setEmail('');

    toast({
      title: "Friend Added",
      description: `${name} has been added to your group.`,
    });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="friendName">Friend's Name</Label>
            <Input
              id="friendName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>
          <div>
            <Label htmlFor="friendEmail">Email</Label>
            <Input
              id="friendEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Friend
        </Button>
      </form>

      <div className="space-y-3">
        <h4 className="font-semibold text-lg">Current Group ({friends.length})</h4>
        {friends.map((friend) => (
          <Card key={friend.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium">{friend.name}</h5>
                  <p className="text-sm text-gray-600">{friend.email}</p>
                </div>
                {friend.id !== '1' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveFriend(friend.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
