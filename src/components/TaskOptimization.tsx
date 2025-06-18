
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { partnerServices } from '@/data/partnerServicesData';

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

  // Combine real affiliate services with simulated third-party apps
  const allApps = [
    // Real affiliate partner services
    ...partnerServices.map(service => ({
      name: service.name,
      product: service.product,
      price: service.price,
      description: service.description,
      commissionRate: service.commissionRate,
      isRealAffiliate: true,
      affiliateUrl: service.affiliateUrl,
      cjAffiliateId: service.cjAffiliateId
    })),
    // Simulated third-party apps
    { name: "StreamMax Pro", product: "Premium Streaming Service", price: 29.99, description: "Unlimited 4K streaming with exclusive content", commissionRate: 0.05, isRealAffiliate: false },
    { name: "FitTracker Elite", product: "Advanced Fitness Tracker", price: 199.99, description: "Monitor your health with precision sensors", commissionRate: 0.05, isRealAffiliate: false },
    { name: "CloudSync Business", product: "Enterprise Cloud Storage", price: 49.99, description: "Secure your data with 1TB cloud storage", commissionRate: 0.05, isRealAffiliate: false },
    { name: "GameVault Premium", product: "Gaming Subscription", price: 19.99, description: "Access to 500+ premium games", commissionRate: 0.05, isRealAffiliate: false },
    { name: "DesignSuite Pro", product: "Creative Design Tools", price: 89.99, description: "Professional design software suite", commissionRate: 0.05, isRealAffiliate: false },
    { name: "LearnHub Academy", product: "Online Course Platform", price: 39.99, description: "Master new skills with expert-led courses", commissionRate: 0.05, isRealAffiliate: false },
    { name: "SecureVPN Ultra", product: "Premium VPN Service", price: 12.99, description: "Anonymous browsing with global servers", commissionRate: 0.05, isRealAffiliate: false },
    { name: "PhotoEdit Master", product: "Photo Editing Software", price: 79.99, description: "Professional photo editing tools", commissionRate: 0.05, isRealAffiliate: false },
    { name: "MusicStream Plus", product: "Music Streaming Service", price: 14.99, description: "High-quality music with offline downloads", commissionRate: 0.05, isRealAffiliate: false },
    { name: "TaskManager Pro", product: "Productivity Suite", price: 24.99, description: "Organize your work and boost productivity", commissionRate: 0.05, isRealAffiliate: false }
  ];

  const startOptimization = () => {
    if (showingApp || tasksCompleted >= maxTasks) return;
    
    const randomIndex = Math.floor(Math.random() * allApps.length);
    setCurrentAppIndex(randomIndex);
    setShowingApp(true);
    
    const app = allApps[randomIndex];
    const commission = app.price * app.commissionRate;
    
    setTimeout(() => {
      onTaskComplete(commission);
      setShowingApp(false);
      
      toast({
        title: "Task Completed!",
        description: `Earned $${commission.toFixed(2)} from ${app.name}${app.isRealAffiliate ? ' (Real Affiliate Partner!)' : ''}`,
      });
    }, 3000);
  };

  const currentApp = allApps[currentAppIndex];
  const canStartTask = tasksCompleted < maxTasks && !showingApp && !hasWithdrawn;

  return (
    <>
      {/* Third-party App Display */}
      {showingApp && (
        <Card className="border-2 border-primary animate-pulse">
          <CardHeader>
            <CardTitle className="text-center text-xl flex items-center justify-center gap-2">
              {currentApp.name}
              {currentApp.isRealAffiliate && (
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                  Real Partner
                </span>
              )}
              {currentApp.cjAffiliateId && (
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                  CJ Affiliate
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className={`${currentApp.isRealAffiliate ? 'bg-gradient-to-r from-green-500 to-blue-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'} text-white p-6 rounded-lg`}>
              <h3 className="text-2xl font-bold mb-2">{currentApp.product}</h3>
              <p className="text-lg mb-4">{currentApp.description}</p>
              <div className="text-3xl font-bold">${currentApp.price}</div>
              <div className="text-sm mt-2 opacity-90">
                You earn: ${(currentApp.price * currentApp.commissionRate).toFixed(2)} ({(currentApp.commissionRate * 100).toFixed(0)}% commission)
              </div>
              {currentApp.isRealAffiliate && (
                <div className="text-sm mt-2 opacity-90 font-semibold">
                  🎉 This is a REAL affiliate partnership!
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {currentApp.isRealAffiliate ? 'Processing real affiliate interaction...' : 'Processing your interaction...'}
            </p>
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
                  "Click start to interact with partner advertisements (including real affiliate partners) and earn commissions"
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
