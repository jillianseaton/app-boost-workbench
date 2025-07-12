
import React from 'react';
import CurrentTime from '@/components/CurrentTime';
import DashboardStats from '@/components/DashboardStats';

interface EarningsSectionProps {
  earnings: number;
  tasksCompleted: number;
  maxTasks: number;
  onResetTasks: () => void;
  userEmail?: string;
  userId?: string;
  todaysEarnings?: number;
}

const EarningsSection: React.FC<EarningsSectionProps> = ({
  earnings,
  tasksCompleted,
  maxTasks,
  onResetTasks
}) => {
  return (
    <div className="space-y-6">
      <CurrentTime />
      <DashboardStats
        earnings={earnings}
        tasksCompleted={tasksCompleted}
        maxTasks={maxTasks}
        onResetTasks={onResetTasks}
      />
    </div>
  );
};

export default EarningsSection;
