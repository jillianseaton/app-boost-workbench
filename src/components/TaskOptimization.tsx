
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface TaskOptimizationProps {
  tasksCompleted: number;
  maxTasks: number;
  hasWithdrawn: boolean;
  onTaskComplete: (commission: number) => void;
  onResetAccount: () => void;
}

const TaskOptimization: React.FC<TaskOptimizationProps> = ({ 
  tasksCompleted, 
  maxTasks, 
  hasWithdrawn, 
  onTaskComplete, 
  onResetAccount 
}) => {
  const [currentAppIndex, setCurrentAppIndex] = useState(0);
  const [showingApp, setShowingApp] = useState(false);
  const { toast } = useToast();

  const thirdPartyApps = [
    { name: "StreamMax Pro", product: "Premium Streaming Service", price: 29.99, description: "Unlimited 4K streaming with exclusive content" },
    { name: "FitTracker Elite", product: "Advanced Fitness Tracker", price: 199.99, description: "Monitor your health with precision sensors" },
    { name: "CloudSync Business", product: "Enterprise Cloud Storage", price: 49.99, description: "Secure your data with 1TB cloud storage" },
    { name: "GameVault Premium", product: "Gaming Subscription", price: 19.99, description: "Access to 500+ premium games" },
    { name: "DesignSuite Pro", product: "Creative Design Tools", price: 89.99, description: "Professional design software suite" },
    { name: "LearnHub Academy", product: "Online Course Platform", price: 39.99, description: "Master new skills with expert-led courses" },
    { name: "SecureVPN Ultra", product: "Premium VPN Service", price: 12.99, description: "Anonymous browsing with global servers" },
    { name: "PhotoEdit Master", product: "Photo Editing Software", price: 79.99, description: "Professional photo editing tools" },
    { name: "MusicStream Plus", product: "Music Streaming Service", price: 14.99, description: "High-quality music with offline downloads" },
    { name: "TaskManager Pro", product: "Productivity Suite", price: 24.99, description: "Organize your work and boost productivity" }
  ];

  const startOptimization = () => {
    if (showingApp || tasksCompleted >= maxTasks) return;
    
    const randomIndex = Math.floor(Math.random() * thirdPartyApps.length);
    setCurrentAppIndex(randomIndex);
    setShowingApp(true);
    
    const app = thirdPartyApps[randomIndex];
    const commission = app.price * 0.05; // 5% commission
    
    setTimeout(() => {
      onTaskComplete(commission);
      setShowingApp(false);
      
      toast({
        title: "Task Completed!",
        description: `Earned $${commission.toFixed(2)} from ${app.name}`,
      });
    }, 3000);
  };

  const currentApp = thirdPartyApps[currentAppIndex];
  const canStartTask = tasksCompleted < maxTasks && !showingApp && !hasWithdrawn;

  return (
    <>
      {/* Third-party App Display */}
      {showingApp && (
        <Card className="border-2 border-primary animate-pulse">
          <CardHeader>
            <CardTitle className="text-center text-xl">{currentApp.name}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 rounded-lg">
              <h3 className="text-2xl font-bold mb-2">{currentApp.product}</h3>
              <p className="text-lg mb-4">{currentApp.description}</p>
              <div className="text-3xl font-bold">${currentApp.price}</div>
              <div className="text-sm mt-2 opacity-90">You earn: ${(currentApp.price * 0.05).toFixed(2)} (5% commission)</div>
            </div>
            <p className="text-sm text-muted-foreground">Processing your interaction...</p>
          </CardContent>
        </Card>
      )}

      {/* Main Action */}
      <Card>
        <CardContent className="p-8 text-center space-y-6">
          {!hasWithdrawn ? (
            <>
              <Button
                onClick={startOptimization}
                disabled={!canStartTask}
                size="lg"
                className="w-full md:w-auto px-12 py-6 text-xl"
              >
                {showingApp ? "Processing..." : 
                 tasksCompleted >= maxTasks ? "Complete 20/20 - Reset to Continue" :
                 `Start Optimization Task (${tasksCompleted}/${maxTasks})`}
              </Button>
              <p className="text-sm text-muted-foreground">
                {tasksCompleted >= maxTasks ? 
                  "You've completed all daily tasks. Reset to continue earning!" :
                  "Click start to interact with partner advertisements and earn 5% commission"
                }
              </p>
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-lg text-green-600 font-semibold">✅ Withdrawal completed for today!</p>
              <Button onClick={onResetAccount} size="lg" variant="outline">
                Reset Account for Tomorrow
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default TaskOptimization;
