
import React, { useState } from 'react';
import TaskOptimization from '@/components/TaskOptimization';
import PartnerServices from '@/components/PartnerServices';
import AvailableOptimizationTasks from './AvailableOptimizationTasks';

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
  onResetAccount
}) => {
  const [isOptimizationTaskRunning, setIsOptimizationTaskRunning] = useState(false);

  const handleOptimizationTaskStart = async (application: any) => {
    setIsOptimizationTaskRunning(true);
    
    // Simulate task execution time based on difficulty
    const executionTime = {
      'Easy': 3000,
      'Medium': 5000,
      'Hard': 8000
    }[application.difficulty] || 5000;

    setTimeout(async () => {
      setIsOptimizationTaskRunning(false);
      // Complete the task with the application's base reward
      await onTaskComplete(application.baseReward);
    }, executionTime);
  };
  return (
    <div className="space-y-6">
      <AvailableOptimizationTasks
        onTaskStart={handleOptimizationTaskStart}
        isTaskRunning={isOptimizationTaskRunning}
      />

      <TaskOptimization 
        tasksCompleted={tasksCompleted}
        maxTasks={maxTasks}
        hasWithdrawn={hasWithdrawn}
        onTaskComplete={onTaskComplete}
        onResetAccount={onResetAccount}
        userEmail={userEmail}
        userId={userId}
      />

      <PartnerServices />
    </div>
  );
};

export default TasksSection;
