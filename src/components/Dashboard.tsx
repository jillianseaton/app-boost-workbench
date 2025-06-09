
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTransactions } from '@/hooks/useTransactions';
import CurrentTime from './CurrentTime';
import EarningsCards from './EarningsCards';
import TaskOptimization from './TaskOptimization';
import WithdrawalSection from './WithdrawalSection';
import PartnerServices from './PartnerServices';
import TransactionHistory from './TransactionHistory';
import MetaMaskWallet from './MetaMaskWallet';

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
  const { toast } = useToast();

  const maxTasks = 20;

  const { transactions, addTransaction, updateTransaction } = useTransactions();

  // Initialize selectedWallet as null to avoid Bitcoin library issues
  const selectedWallet = null;

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

  const handleTaskComplete = (commission: number) => {
    setEarnings(prev => prev + commission);
    setTasksCompleted(prev => prev + 1);
    
    addTransaction({
      type: 'earning',
      amount: commission,
      status: 'confirmed',
    });
  };

  const resetAccount = () => {
    setEarnings(0);
    setTasksCompleted(0);
    setHasWithdrawn(false);
    toast({
      title: "Account Reset",
      description: "Ready for a new day of earning!",
    });
  };

  return (
    <div className="space-y-6">
      <CurrentTime />

      <EarningsCards
        availableEarnings={earnings}
        withdrawalAmount={0}
        tasksCompleted={tasksCompleted}
        maxTasks={maxTasks}
        resetTasks={resetTasks}
      />

      <MetaMaskWallet />

      <TaskOptimization 
        tasksCompleted={tasksCompleted}
        maxTasks={maxTasks}
        hasWithdrawn={hasWithdrawn}
        onTaskComplete={handleTaskComplete}
        onResetAccount={resetAccount}
      />

      <WithdrawalSection 
        earnings={earnings}
        tasksCompleted={tasksCompleted}
        hasWithdrawn={hasWithdrawn}
        selectedWallet={selectedWallet}
        setEarnings={setEarnings}
        setHasWithdrawn={setHasWithdrawn}
        addTransaction={addTransaction}
        updateTransaction={updateTransaction}
        user={user}
      />

      <TransactionHistory transactions={transactions} />

      <PartnerServices />
    </div>
  );
};

export default Dashboard;
