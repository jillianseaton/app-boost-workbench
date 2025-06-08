
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Clock, Wallet, TrendingUp, Users, Star, RotateCcw } from 'lucide-react';
import TaskOptimization from './TaskOptimization';
import WithdrawalSection from './WithdrawalSection';
import PartnerServices from './PartnerServices';

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
  const [currentTime, setCurrentTime] = useState(new Date());
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

  const handleTaskComplete = (commission: number) => {
    setEarnings(prev => prev + commission);
    setTasksCompleted(prev => prev + 1);
  };

  const handleWithdraw = () => {
    if (earnings < 10) {
      toast({
        title: "Minimum withdrawal not met",
        description: "You need at least $10.00 to withdraw.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Withdrawal Initiated",
      description: `$${earnings.toFixed(2)} sent to your Bitcoin wallet!`,
    });
    
    setHasWithdrawn(true);
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
            <div className="text-2xl font-bold text-green-600">${earnings.toFixed(2)}</div>
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
            <div className="text-xs text-muted-foreground break-all">1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa</div>
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
        earnings={earnings}
        hasWithdrawn={hasWithdrawn}
        onWithdraw={handleWithdraw}
      />

      {/* Partner Services */}
      <PartnerServices />
    </div>
  );
};

export default Dashboard;
