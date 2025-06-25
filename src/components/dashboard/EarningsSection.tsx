
import React from 'react';
import CurrentTime from '@/components/CurrentTime';
import DashboardStats from '@/components/DashboardStats';
import AutomaticPayoutSettings from '@/components/AutomaticPayoutSettings';

interface EarningsSectionProps {
  earnings: number;
  tasksCompleted: number;
  maxTasks: number;
  onResetTasks: () => void;
  userEmail?: string;
  userId?: string;
}

const EarningsSection: React.FC<EarningsSectionProps> = ({
  earnings,
  tasksCompleted,
  maxTasks,
  onResetTasks,
  userEmail = '',
  userId = ''
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
      
      {/* Automatic Payout Settings */}
      <AutomaticPayoutSettings
        userId={userId}
        userEmail={userEmail}
        todaysEarnings={earnings}
      />
    </div>
  );
};

export default EarningsSection;
