
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Clock, Wallet, TrendingUp, Users, Star, RotateCcw } from 'lucide-react';
import TaskOptimization from './TaskOptimization';
import WithdrawalSection from './WithdrawalSection';
import DepositToBank from './DepositToBank';
import PartnerServices from './PartnerServices';
import TransactionHistory from './TransactionHistory';

interface User {
  phoneNumber: string;
  username: string;
}

interface DashboardProps {
  user: User;
}

interface Transaction {
  id: string;
  type: 'withdrawal' | 'earning';
  amount: number;
  address?: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
  txHash?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [earnings, setEarnings] = useState(0);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [hasWithdrawn, setHasWithdrawn] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { toast } = useToast();

  const maxTasks = 20;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const resetTasks = () => {
    if (tasksCompleted < maxTasks) {
      toast({
        title: "Cannot reset tasks",
        description: `Complete all ${maxTasks} tasks before resetting.`,
        variant: "destructive",
      });
      return;
    }

    setTasksCompleted(0);
    toast({
      title: "Tasks Reset Successfully",
      description: `You can now complete ${maxTasks} more optimization tasks!`,
    });
  };

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'timestamp'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
    return newTransaction.id;
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => 
      prev.map(tx => tx.id === id ? { ...tx, ...updates } : tx)
    );
  };

  const handleTaskComplete = (commission: number) => {
    setEarnings(prev => prev + commission);
    setTasksCompleted(prev => prev + 1);
    
    // Add earning transaction
    addTransaction({
      type: 'earning',
      amount: commission,
      status: 'confirmed',
    });
  };

  const handleWithdraw = () => {
    // This will be handled by the WithdrawalSection component via useStripe hook
    // Add transaction when withdrawal is successful
    const transactionId = addTransaction({
      type: 'withdrawal',
      amount: earnings,
      status: 'pending',
    });

    // Reset earnings and set withdrawal flag
    setEarnings(0);
    setHasWithdrawn(true);

    // Update transaction to confirmed after successful withdrawal
    setTimeout(() => {
      updateTransaction(transactionId, { status: 'confirmed' });
    }, 1000);
  };

  const handleBankDeposit = (amount: number) => {
    // Add bank deposit transaction (outgoing from EarnFlow balance)
    const transactionId = addTransaction({
      type: 'withdrawal', // Using withdrawal type for outgoing transactions
      amount: amount,
      status: 'pending',
      address: 'Bank Account Transfer', // Special identifier for bank deposits
    });

    // Deduct amount from earnings balance
    setEarnings(prev => prev - amount);

    toast({
      title: "Balance Updated",
      description: `$${amount.toFixed(2)} deducted from your EarnFlow balance.`,
    });

    // Update transaction to confirmed after successful deposit
    setTimeout(() => {
      updateTransaction(transactionId, { status: 'confirmed' });
    }, 1000);
  };

  const resetAccount = () => {
    setEarnings(0);
    setTasksCompleted(0);
    setHasWithdrawn(false);
    setTransactions([]);
    toast({
      title: "Account Reset",
      description: "Ready for a new day of earning!",
    });
  };

  return (
    <div className="space-y-6">
      {/* Current Time */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <span className="text-xl font-mono">
              {currentTime.toLocaleString('en-US', {
                timeZone: 'America/New_York',
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })} ET
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Earnings Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${earnings.toFixed(2)}</div>
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

      {/* Task Optimization */}
      <TaskOptimization 
        tasksCompleted={tasksCompleted}
        maxTasks={maxTasks}
        hasWithdrawn={hasWithdrawn}
        onTaskComplete={handleTaskComplete}
        onResetAccount={resetAccount}
      />

      {/* Bank Deposit Section - New Feature */}
      <DepositToBank
        currentBalance={earnings}
        onDepositSuccess={handleBankDeposit}
        userEmail={user.phoneNumber}
        userId={user.username}
      />

      {/* Withdrawal Section */}
      <WithdrawalSection 
        earnings={earnings}
        hasWithdrawn={hasWithdrawn}
        onWithdraw={handleWithdraw}
        userEmail={user.phoneNumber}
        userId={user.username}
      />

      {/* Transaction History */}
      <TransactionHistory transactions={transactions} />

      {/* Partner Services */}
      <PartnerServices />
    </div>
  );
};

export default Dashboard;
