
import React from 'react';
import TaskOptimization from '@/components/TaskOptimization';
import SecureBankDashboard from '@/components/SecureBankDashboard';
import PartnerServices from '@/components/PartnerServices';

interface TasksSectionProps {
  tasksCompleted: number;
  maxTasks: number;
  hasWithdrawn: boolean;
  earnings: number;
  userEmail: string;
  userId: string;
  onTaskComplete: (adRevenue: number) => Promise<void>;
  onResetAccount: () => void;
  onWithdraw: () => void;
  onSecureBankDeposit: (amount: number) => void;
}

const TasksSection: React.FC<TasksSectionProps> = ({
  tasksCompleted,
  maxTasks,
  hasWithdrawn,
  earnings,
  userEmail,
  userId,
  onTaskComplete,
  onResetAccount,
  onSecureBankDeposit
}) => {
  return (
    <div className="space-y-6">
      <TaskOptimization 
        tasksCompleted={tasksCompleted}
        maxTasks={maxTasks}
        hasWithdrawn={hasWithdrawn}
        onTaskComplete={onTaskComplete}
        onResetAccount={onResetAccount}
        userEmail={userEmail}
        userId={userId}
      />

      <SecureBankDashboard
        currentBalance={earnings}
        onDepositSuccess={onSecureBankDeposit}
        userEmail={userEmail}
        userId={userId}
      />

      <PartnerServices />
    </div>
  );
};

export default TasksSection;
