import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Clock, Wallet, TrendingUp, Users, Star, RotateCcw } from 'lucide-react';
import TaskOptimization from './TaskOptimization';
import WithdrawalSection from './WithdrawalSection';
import PartnerServices from './PartnerServices';
import TransactionHistory from './TransactionHistory';
import { supabase } from '@/integrations/supabase/client';

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
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState(0); // Track amount being withdrawn
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

  const handleWithdraw = async () => {
    if (earnings < 10) {
      toast({
        title: "Minimum withdrawal not met",
        description: "You need at least $10.00 to withdraw.",
        variant: "destructive",
      });
      return;
    }

    if (isWithdrawing) {
      toast({
        title: "Withdrawal in progress",
        description: "Please wait for the current withdrawal to complete.",
        variant: "destructive",
      });
      return;
    }

    setIsWithdrawing(true);
    setWithdrawalAmount(earnings); // Store the amount being withdrawn

    try {
      console.log('Initiating Stripe withdrawal:', { 
        amount: earnings, 
        userEmail: user.phoneNumber, // Using phone as email for now
        userId: user.username 
      });

      // Add withdrawal transaction but DON'T reset earnings yet
      const transactionId = addTransaction({
        type: 'withdrawal',
        amount: withdrawalAmount,
        status: 'pending',
      });

      toast({
        title: "Bank Withdrawal Initiated",
        description: `$${withdrawalAmount.toFixed(2)} withdrawal initiated. Funds will arrive in 1-2 business days.`,
      });

      // Simulate processing time for demo
      setTimeout(() => {
        updateTransaction(transactionId, { 
          status: 'confirmed'
        });
        
        // NOW reset earnings since withdrawal is confirmed
        setEarnings(prev => prev - withdrawalAmount);
        setHasWithdrawn(true);
        setWithdrawalAmount(0);
        
        toast({
          title: "Withdrawal Confirmed",
          description: `Your withdrawal has been processed and is on its way to your bank account.`,
        });
      }, 5000); // 5 seconds for demo

    } catch (error) {
      console.error('Withdrawal failed:', error);
      setWithdrawalAmount(0); // Reset withdrawal amount on failure
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Unable to process withdrawal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  const resetAccount = () => {
    setEarnings(0);
    setTasksCompleted(0);
    setHasWithdrawn(false);
    setIsWithdrawing(false);
    setWithdrawalAmount(0);
    toast({
      title: "Account Reset",
      description: "Ready for a new day of earning!",
    });
  };

  // Calculate available earnings (total earnings minus amount being withdrawn)
  const availableEarnings = earnings - withdrawalAmount;

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
            <div className="text-2xl font-bold text-green-600">${availableEarnings.toFixed(2)}</div>
            {withdrawalAmount > 0 && (
              <div className="text-xs text-orange-600 mt-1">
                ${withdrawalAmount.toFixed(2)} being withdrawn...
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

      {/* Task Optimization */}
      <TaskOptimization 
        tasksCompleted={tasksCompleted}
        maxTasks={maxTasks}
        hasWithdrawn={hasWithdrawn}
        onTaskComplete={handleTaskComplete}
        onResetAccount={resetAccount}
      />

      {/* Withdrawal Section */}
      <WithdrawalSection 
        earnings={availableEarnings}
        hasWithdrawn={hasWithdrawn}
        onWithdraw={handleWithdraw}
        isWithdrawing={isWithdrawing}
        userEmail={user.phoneNumber} // Using phone as email identifier
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
