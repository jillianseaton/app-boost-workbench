
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Star, Wallet, RotateCcw, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStatsProps {
  earnings: number;
  tasksCompleted: number;
  maxTasks: number;
  onResetTasks: () => void;
  todaysEarnings?: number;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  earnings,
  tasksCompleted,
  maxTasks,
  onResetTasks,
  todaysEarnings = 0
}) => {
  const [realBtcBalance, setRealBtcBalance] = useState<number>(0);
  const [btcLoading, setBtcLoading] = useState(false);
  
  // Check if there's a saved Bitcoin address to query
  const getBitcoinBalance = async () => {
    // Check for your specific Bitcoin address
    const bitcoinAddress = '1N4oefv37jNGD5RMn1F8s1ZmNzgjnW5PJD';
    
    setBtcLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-balance', {
        body: { address: bitcoinAddress }
      });
      
      if (error) throw error;
      
      setRealBtcBalance(data.balanceBTC);
    } catch (error) {
      console.error('Error getting Bitcoin balance:', error);
    } finally {
      setBtcLoading(false);
    }
  };
  
  // Load Bitcoin balance on component mount
  useEffect(() => {
    getBitcoinBalance();
  }, []);
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Commission Earnings</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">${(todaysEarnings / 100).toFixed(2)}</div>
          <p className="text-xs text-muted-foreground mt-1">Today's commissions</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">BTC Earnings</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={getBitcoinBalance}
            disabled={btcLoading}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className={`h-3 w-3 ${btcLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {realBtcBalance.toFixed(8)} BTC
          </div>
          <p className="text-xs text-muted-foreground mt-1">Real Bitcoin balance</p>
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
              onClick={onResetTasks} 
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
          <div className="text-xs text-muted-foreground break-all">bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
