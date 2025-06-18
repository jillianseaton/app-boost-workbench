
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { partnerServices } from '@/data/partnerServicesData';
import { ExternalLink, DollarSign } from 'lucide-react';

interface TaskOptimizationProps {
  tasksCompleted: number;
  maxTasks: number;
  hasWithdrawn: boolean;
  onTaskComplete: (commission: number) => void;
  onResetAccount: () => void;
  userEmail?: string;
  userId?: string;
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
  onResetAccount,
  userEmail = '',
  userId = ''
}) => {
  const [currentAppIndex, setCurrentAppIndex] = useState(0);
  const [showingApp, setShowingApp] = useState(false);
  const { toast } = useToast();

  // Real affiliate services - these are YOUR revenue sources
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
    { name: "CloudSync Business", product: "Enterprise Cloud Storage", price: 49.99, description: "Secure your data with 1TB cloud storage", commissionRate: 0.05, isRealAffiliate: false }
  ];

  // Prioritize YOUR real affiliate services (90% chance)
  const getRandomApp = (): AppService => {
    const shouldShowRealAffiliate = Math.random() < 0.9; // 90% chance of YOUR affiliate services
    
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
    
    // Calculate ad revenue payment to you (higher rates for your affiliate partners)
    const adRevenue = selectedApp.isRealAffiliate 
      ? Math.random() * 15 + 10  // $10-25 for your affiliate partners
      : Math.random() * 8 + 5;   // $5-13 for simulated apps
    
    setTimeout(() => {
      // Complete the task and earn ad revenue
      onTaskComplete(adRevenue);
      setShowingApp(false);
      
      // Show success message
      if (selectedApp.isRealAffiliate) {
        toast({
          title: "💰 Ad Revenue Earned!",
          description: `You earned $${adRevenue.toFixed(2)} in ad revenue from ${selectedApp.name} optimization! (Your CJ Affiliate Partner)`,
        });
      } else {
        toast({
          title: "Ad Revenue Earned!",
          description: `You earned $${adRevenue.toFixed(2)} in ad revenue from ${selectedApp.name} optimization!`,
        });
      }
    }, 3000);

    toast({
      title: "Optimization Started!",
      description: `Running ${selectedApp.name} optimization task. Advertisers are paying for this exposure!`,
    });
  };

  const allApps = [...realAffiliateServices, ...simulatedApps];
  const currentApp = allApps[currentAppIndex] || allApps[0];
  const canStartTask = tasksCompleted < maxTasks && !showingApp && !hasWithdrawn;

  return (
    <>
      {/* Third-party App Display - YOUR Revenue Sources */}
      {showingApp && (
        <Card className={`border-2 animate-pulse ${currentApp?.isRealAffiliate ? 'border-green-500 bg-green-50' : 'border-primary'}`}>
          <CardHeader>
            <CardTitle className="text-center text-xl flex items-center justify-center gap-2">
              {currentApp?.name}
              {currentApp?.isRealAffiliate && (
                <span className="text-xs px-2 py-1 rounded-full bg-green-500 text-white font-bold animate-pulse">
                  💰 YOUR CJ PARTNER
                </span>
              )}
              {currentApp?.cjAffiliateId && (
                <span className="text-xs px-2 py-1 rounded-full bg-blue-500 text-white">
                  CJ ID: 7602933
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
                Product Value: ${currentApp?.price}
              </div>
              <div className="text-sm mt-2 opacity-75">
                Ad Revenue Rate: ${currentApp?.isRealAffiliate ? '$10-25' : '$5-13'} per optimization
              </div>
              {currentApp?.isRealAffiliate && (
                <div className="text-sm mt-3 bg-white/20 rounded p-2 font-semibold">
                  💰 Generating ad revenue from your CJ partnership...
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {currentApp?.isRealAffiliate ? 'Optimizing your CJ affiliate partner site...' : 'Processing optimization task...'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Main Action */}
      <Card>
        <CardContent className="p-8 text-center space-y-6">
          {!hasWithdrawn ? (
            <>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-center gap-2 text-green-800">
                  <DollarSign className="h-5 w-5" />
                  <span className="font-semibold">Ad-Sponsored Optimization Tasks</span>
                </div>
                <p className="text-sm text-green-700 mt-2">
                  Advertisers pay you $5-25 per optimization task. Run optimizations to earn ad revenue from your affiliate partnerships.
                </p>
              </div>

              <Button
                onClick={startOptimization}
                disabled={!canStartTask}
                size="lg"
                className="w-full md:w-auto px-12 py-6 text-xl bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                {showingApp ? "Processing..." : 
                 tasksCompleted >= maxTasks ? "Complete 20/20 - Reset to Continue" :
                 `Run Ad-Sponsored Optimization (${tasksCompleted}/${maxTasks})`}
              </Button>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {tasksCompleted >= maxTasks ? 
                    "You've completed all daily tasks. Reset to continue earning!" :
                    "Advertisers pay you to run optimization tasks that showcase your affiliate partners"
                  }
                </p>
                <p className="text-xs text-green-600 font-medium">
                  💰 90% chance of YOUR CJ affiliate partners (ID: 7602933) - Higher ad revenue rates!
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-lg text-green-600 font-semibold">✅ Daily earnings completed!</p>
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
