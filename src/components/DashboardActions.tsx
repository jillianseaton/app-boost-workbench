
import React from 'react';
import { useToast } from '@/hooks/use-toast';

interface DashboardActionsProps {
  tasksCompleted: number;
  maxTasks: number;
  onResetTasks: () => void;
  onResetAccount: () => void;
}

const DashboardActions: React.FC<DashboardActionsProps> = ({
  tasksCompleted,
  maxTasks,
  onResetTasks,
  onResetAccount
}) => {
  const { toast } = useToast();

  const resetTasks = () => {
    if (tasksCompleted < maxTasks) {
      toast({
        title: "Cannot reset tasks",
        description: `Complete all ${maxTasks} tasks before resetting.`,
        variant: "destructive",
      });
      return;
    }

    onResetTasks();
    toast({
      title: "Tasks Reset Successfully",
      description: `You can now complete ${maxTasks} more optimization tasks!`,
    });
  };

  const resetAccount = () => {
    onResetAccount();
    toast({
      title: "Account Reset",
      description: "Ready for a new day of earning!",
    });
  };

  return null; // This component provides actions but doesn't render anything
};

export { DashboardActions };
export const useDashboardActions = (
  tasksCompleted: number,
  maxTasks: number,
  onResetTasks: () => void,
  onResetAccount: () => void
) => {
  const { toast } = useToast();

  const resetTasks = () => {
    if (tasksCompleted < maxTasks) {
      toast({
        title: "Cannot reset tasks",
        description: `Complete all ${maxTasks} tasks before resetting.`,
        variant: "destructive",
      });
      return;
    }

    onResetTasks();
    toast({
      title: "Tasks Reset Successfully",
      description: `You can now complete ${maxTasks} more optimization tasks!`,
    });
  };

  const resetAccount = () => {
    onResetAccount();
    toast({
      title: "Account Reset",
      description: "Ready for a new day of earning!",
    });
  };

  return { resetTasks, resetAccount };
};

export default DashboardActions;
