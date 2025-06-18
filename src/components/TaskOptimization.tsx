
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { partnerServices } from '@/data/partnerServicesData';
import { ExternalLink } from 'lucide-react';

interface TaskOptimizationProps {
  tasksCompleted: number;
  maxTasks: number;
  hasWithdrawn: boolean;
  onTaskComplete: (commission: number) => void;
  onResetAccount: () => void;
}

interface AppService {
  name: string;
  product: string;
  price: number;
  description: string;
  commissionRate: number;
  isRealAffiliate: boolean;
  affiliateUrl?: string;
  cjAffiliateId?: string;
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

  // Real affiliate services (weighted to appear more frequently)
  const realAffiliateServices: AppService[] = partnerServices
    .filter(service => service.billingPeriod === 'one-time')
    .map(service => ({
      name: service.name,
      product: service.product,
      price: service.price,
      description: service.description,
      commissionRate: service.commissionRate,
      isRealAffiliate: true,
      affiliateUrl: service.affiliateUrl,
      cjAffiliateId: service.cjAffiliateId
    }));

  // Simulated apps for variety
  const simulatedApps: AppService[] = [
    { name: "StreamMax Pro", product: "Premium Streaming Service", price: 29.99, description: "Unlimited 4K streaming with exclusive content", commissionRate: 0.05, isRealAffiliate: false },
    { name: "FitTracker Elite", product: "Advanced Fitness Tracker", price: 199.99, description: "Monitor your health with precision sensors", commissionRate: 0.05, isRealAffiliate: false },
    { name: "CloudSync Business", product: "Enterprise Cloud Storage", price: 49.99, description: "Secure your data with 1TB cloud storage", commissionRate: 0.05, isRealAffiliate: false },
    { name: "GameVault Premium", product: "Gaming Subscription", price: 19.99, description: "Access to 500+ premium games", commissionRate: 0.05, isRealAffiliate: false },
    { name: "DesignSuite Pro", product: "Creative Design Tools", price: 89.99, description: "Professional design software suite", commissionRate: 0.05, isRealAffiliate: false }
  ];

  // Weight real affiliate services to appear 70% of the time
  const getRandomApp = (): AppService => {
    const shouldShowRealAffiliate = Math.random() < 0.7; // 70% chance
    
    if (shouldShowRealAffiliate && realAffiliateServices.length > 0) {
      const randomIndex = Math.floor(Math.random() * realAffiliateServices.length);
      return realAffiliateServices[randomIndex];
    } else {
      const randomIndex = Math.floor(Math.random() * simulatedApps.length);
      return simulatedApps[randomIndex];
    }
  };

  const startOptimization = () => {
    if (showingApp || tasksCompleted >= maxTasks) return;
    
    const selectedApp = getRandomApp();
    
    // Find the index for display purposes
    const allApps = [...realAffiliateServices, ...simulatedApps];
    const appIndex = allApps.findIndex(app => 
      app.name === selectedApp.name && app.isRealAffiliate === selectedApp.isRealAffiliate
    );
    
    setCurrentAppIndex(appIndex >= 0 ? appIndex : 0);
    setShowingApp(true);
    
    const commission = selectedApp.price * selectedApp.commissionRate;
    
    // Store current app for completion
    const currentApp = selectedApp;
    
    setTimeout(() => {
      // If it's a real affiliate service, open the affiliate URL
      if (currentApp.isRealAffiliate && currentApp.affiliateUrl) {
        // Add tracking parameters to the affiliate URL
        const affiliateUrl = new URL(currentApp.affiliateUrl);
        if (currentApp.cjAffiliateId) {
          affiliateUrl.searchParams.append('sid', 'task_optimization');
        }
        
        // Open in new tab
        window.open(affiliateUrl.toString(), '_blank', 'noopener,noreferrer');
        
        toast({
          title: "🎉 Real Affiliate Partner!",
          description: `Opened ${currentApp.name} - Complete your purchase to earn commission!`,
        });
      }
      
      onTaskComplete(commission);
      setShowingApp(false);
      
      toast({
        title: "Task Completed!",
        description: `Earned $${commission.toFixed(2)} from ${currentApp.name}${currentApp.isRealAffiliate ? ' (Real Affiliate Partner!)' : ''}`,
      });
    }, 3000);
  };

  const allApps = [...realAffiliateServices, ...simulatedApps];
  const currentApp = allApps[currentAppIndex] || allApps[0];
  const canStartTask = tasksCompleted < maxTasks && !showingApp && !hasWithdrawn;

  return (
    <>
      {/* Third-party App Display */}
      {showingApp && (
        <Card className={`border-2 animate-pulse ${currentApp?.isRealAffiliate ? 'border-green-500 bg-green-50' : 'border-primary'}`}>
          <CardHeader>
            <CardTitle className="text-center text-xl flex items-center justify-center gap-2">
              {currentApp?.name}
              {currentApp?.isRealAffiliate && (
                <span className="text-xs px-2 py-1 rounded-full bg-green-500 text-white font-bold animate-pulse">
                  🎉 REAL PARTNER
                </span>
              )}
              {currentApp?.cjAffiliateId && (
                <span className="text-xs px-2 py-1 rounded-full bg-blue-500 text-white">
                  CJ Affiliate
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className={`${currentApp?.isRealAffiliate ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-blue-500 to-purple-500'} text-white p-6 rounded-lg`}>
              <h3 className="text-2xl font-bold mb-2">{currentApp?.product}</h3>
              <p className="text-lg mb-4">{currentApp?.description}</p>
              <div className="text-3xl font-bold">${currentApp?.price}</div>
              <div className="text-sm mt-2 opacity-90">
                You earn: ${(currentApp?.price * currentApp?.commissionRate).toFixed(2)} ({(currentApp?.commissionRate * 100).toFixed(0)}% commission)
              </div>
              {currentApp?.isRealAffiliate && (
                <div className="text-sm mt-3 bg-white/20 rounded p-2 font-semibold flex items-center justify-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Opening real affiliate link...
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {currentApp?.isRealAffiliate ? 'Processing real affiliate interaction and opening purchase page...' : 'Processing your interaction...'}
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
                className="w-full md:w-auto px-12 py-6 text-xl bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                {showingApp ? "Processing..." : 
                 tasksCompleted >= maxTasks ? "Complete 20/20 - Reset to Continue" :
                 `Start Optimization Task (${tasksCompleted}/${maxTasks})`}
              </Button>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {tasksCompleted >= maxTasks ? 
                    "You've completed all daily tasks. Reset to continue earning!" :
                    "Click start to interact with partner advertisements and earn real commissions"
                  }
                </p>
                <p className="text-xs text-green-600 font-medium">
                  70% chance of real affiliate partners (1-800-FLORALS, Birthday Flowers, etc.)
                </p>
              </div>
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
