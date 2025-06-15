
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import CurrentTime from './CurrentTime';
import DashboardStats from './DashboardStats';
import { useDashboardActions } from './DashboardActions';
import TaskOptimization from './TaskOptimization';
import WithdrawalSection from './WithdrawalSection';
import DepositToBank from './DepositToBank';
import PartnerServices from './PartnerServices';
import TransactionHistory from './TransactionHistory';
import { Transaction } from '@/utils/transactionUtils';

interface User {
  phoneNumber: string;
  username: string;
}

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [earnings, setEarnings] = useState(0);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [hasWithdrawn, setHasWithdrawn] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { toast } = useToast();

  const maxTasks = 20;

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

  const handleTaskComplete = (commission: number) => {
    setEarnings(prev => prev + commission);
    setTasksCompleted(prev => prev + 1);
    
    addTransaction({
      type: 'earning',
      amount: commission,
      status: 'confirmed',
    });
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

  const handleBankDeposit = (amount: number) => {
    const transactionId = addTransaction({
      type: 'withdrawal',
      amount: amount,
      status: 'pending',
      address: 'Bank Account Transfer',
    });

    setEarnings(prev => prev - amount);

    toast({
      title: "Balance Updated",
      description: `$${amount.toFixed(2)} deducted from your EarnFlow balance.`,
    });

    setTimeout(() => {
      updateTransaction(transactionId, { status: 'confirmed' });
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <CurrentTime />

      <DashboardStats
        earnings={earnings}
        tasksCompleted={tasksCompleted}
        maxTasks={maxTasks}
        onResetTasks={resetTasks}
      />

      <TaskOptimization 
        tasksCompleted={tasksCompleted}
        maxTasks={maxTasks}
        hasWithdrawn={hasWithdrawn}
        onTaskComplete={handleTaskComplete}
        onResetAccount={resetAccount}
      />

      <DepositToBank
        currentBalance={earnings}
        onDepositSuccess={handleBankDeposit}
        userEmail={user.phoneNumber}
        userId={user.username}
      />

      <WithdrawalSection 
        earnings={earnings}
        hasWithdrawn={hasWithdrawn}
        onWithdraw={handleWithdraw}
        userEmail={user.phoneNumber}
        userId={user.username}
      />

      <TransactionHistory transactions={transactions} />

      <PartnerServices />
    </div>
  );
};

export default Dashboard;
