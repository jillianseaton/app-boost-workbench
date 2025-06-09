
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Star, Wallet, RotateCcw } from 'lucide-react';

interface EarningsCardsProps {
  availableEarnings: number;
  withdrawalAmount: number;
  tasksCompleted: number;
  maxTasks: number;
  resetTasks: () => void;
}

const EarningsCards: React.FC<EarningsCardsProps> = ({
  availableEarnings,
  withdrawalAmount,
  tasksCompleted,
  maxTasks,
  resetTasks,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today's Earnings</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">${availableEarnings.toFixed(2)}</div>
          {withdrawalAmount > 0 && (
            <div className="text-xs text-orange-600 mt-1">
              ${withdrawalAmount.toFixed(2)} pending blockchain confirmation...
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{tasksCompleted}/{maxTasks}</div>
          {tasksCompleted >= maxTasks && (
            <Button 
              onClick={resetTasks} 
              size="sm" 
              variant="outline" 
              className="mt-2 w-full"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Tasks
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Bitcoin Wallet</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground break-all">bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EarningsCards;
