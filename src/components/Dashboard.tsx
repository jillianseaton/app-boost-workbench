
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardActions } from './DashboardActions';
import { Transaction } from '@/utils/transactionUtils';
import { useCommissions } from '@/hooks/useCommissions';
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
    setEarnings(prev => prev + adRevenue);
    setTasksCompleted(prev => prev + 1);
    
    // Add transaction record
    addTransaction({
      type: 'earning',
      amount: adRevenue,
      status: 'confirmed',
    });

    // Add commission record
    if (userId) {
      await addCommission(
        Math.round(adRevenue * 100), // Convert to cents
        `Task completion earnings: $${adRevenue.toFixed(2)}`,
        'task_completion'
      );
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
              💸 Commission Payout Dashboard
            </h1>
            <p className="text-gray-600">
              Sign in to access your earnings and request payouts
            </p>
          </div>
          <GoogleAuth />
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
      />

      <PayoutSection userId={userId} />

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
