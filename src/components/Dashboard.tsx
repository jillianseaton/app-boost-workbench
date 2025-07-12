
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardActions } from './DashboardActions';
import { Transaction } from '@/utils/transactionUtils';
import { useCommissions } from '@/hooks/useCommissions';
import { supabase } from '@/integrations/supabase/client';
import GoogleAuth from './GoogleAuth';
import PrivacyPolicy from './PrivacyPolicy';
import DashboardHeader from './dashboard/DashboardHeader';
import EarningsSection from './dashboard/EarningsSection';
import PayoutSection from './dashboard/PayoutSection';
import TasksSection from './dashboard/TasksSection';
import TransactionSection from './dashboard/TransactionSection';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState(0);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [hasWithdrawn, setHasWithdrawn] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const { toast } = useToast();

  const maxTasks = 20;
  const userEmail = user?.email || '';
  const userId = user?.id || '';

  // Add commission tracking
  const { addCommission } = useCommissions(userId);

  const { resetTasks, resetAccount } = useDashboardActions(
    tasksCompleted,
    maxTasks,
    () => {
      setTasksCompleted(0);
    },
    () => {
      setEarnings(0);
      setTasksCompleted(0);
      setHasWithdrawn(false);
      setTransactions([]);
    }
  );

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

  const handleTaskComplete = async (adRevenue: number) => {
    try {
      // Get BTC price and convert to BTC directly
      const { data: priceData, error: priceError } = await supabase.functions.invoke('get-btc-price');
      
      if (priceError) {
        console.error('Error getting BTC price:', priceError);
        toast({
          title: "Error",
          description: "Failed to convert earnings to BTC. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      const btcPrice = priceData.price;
      const btcEarnings = adRevenue / btcPrice;
      
      setEarnings(prev => prev + btcEarnings); // Track BTC earnings instead of USD
      setTasksCompleted(prev => prev + 1);
      
      // Add transaction record showing BTC earnings
      addTransaction({
        type: 'earning',
        amount: btcEarnings,
        status: 'confirmed',
      });

      // Add commission record and mark as immediately paid out in BTC
      if (userId) {
        await addCommission(
          Math.round(adRevenue * 100), // Convert to cents for record keeping
          `Task completion earnings converted to BTC: ${btcEarnings.toFixed(8)} BTC (from $${adRevenue.toFixed(2)})`,
          'task_completion'
        );
        
        // Mark commission as immediately paid out since it went to BTC
        await supabase
          .from('commissions')
          .update({ paid_out: true, paid_at: new Date().toISOString() })
          .eq('user_id', userId)
          .eq('paid_out', false);
      }

      toast({
        title: "Earned Bitcoin!",
        description: `Converted $${adRevenue.toFixed(2)} directly to ${btcEarnings.toFixed(8)} BTC`,
      });
      
    } catch (error) {
      console.error('Error processing task completion:', error);
      toast({
        title: "Error",
        description: "Failed to process earnings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleWithdraw = () => {
    const transactionId = addTransaction({
      type: 'withdrawal',
      amount: earnings,
      status: 'pending',
    });

    setEarnings(0);
    setHasWithdrawn(true);

    setTimeout(() => {
      updateTransaction(transactionId, { status: 'confirmed' });
    }, 1000);
  };

  const handleSecureBankDeposit = (amount: number) => {
    const transactionId = addTransaction({
      type: 'withdrawal',
      amount: amount,
      status: 'pending',
      address: 'Verified Bank Account Transfer',
    });

    setEarnings(prev => prev - amount);

    toast({
      title: "Secure Deposit Initiated",
      description: `$${amount.toFixed(2)} securely transferred to your verified bank account.`,
    });

    setTimeout(() => {
      updateTransaction(transactionId, { status: 'confirmed' });
    }, 2000);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              💸 Dashboard
            </h1>
            <p className="text-gray-600">
              Please sign in to access your dashboard
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (showPrivacyPolicy) {
    return <PrivacyPolicy onBack={() => setShowPrivacyPolicy(false)} />;
  }

  return (
    <div className="space-y-6">
      <DashboardHeader 
        userEmail={userEmail}
        onShowPrivacyPolicy={() => setShowPrivacyPolicy(true)}
      />

      <EarningsSection
        earnings={earnings}
        tasksCompleted={tasksCompleted}
        maxTasks={maxTasks}
        onResetTasks={resetTasks}
        userEmail={userEmail}
        userId={userId}
      />

      <PayoutSection 
        userId={userId} 
        earnings={earnings} 
        onWithdraw={(amount) => {
          setEarnings(prev => prev - amount);
          addTransaction({
            type: 'withdrawal',
            amount: amount,
            status: 'confirmed',
            address: 'MetaMask Wallet',
          });
        }} 
      />

      <TasksSection
        tasksCompleted={tasksCompleted}
        maxTasks={maxTasks}
        hasWithdrawn={hasWithdrawn}
        earnings={earnings}
        userEmail={userEmail}
        userId={userId}
        onTaskComplete={handleTaskComplete}
        onResetAccount={resetAccount}
        onWithdraw={handleWithdraw}
        onSecureBankDeposit={handleSecureBankDeposit}
      />

      <TransactionSection transactions={transactions} />
    </div>
  );
};

export default Dashboard;
