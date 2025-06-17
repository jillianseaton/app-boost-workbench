
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  DollarSign, 
  MousePointer, 
  ShoppingCart,
  Eye,
  Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AffiliateStats {
  totalClicks: number;
  totalConversions: number;
  totalCommission: number;
  conversionRate: string;
  topPerformingServices: Array<{
    name: string;
    conversions: number;
    commission: number;
  }>;
}

const AffiliateDashboard: React.FC = () => {
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [earnings, setEarnings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAffiliateData();
  }, []);

  const loadAffiliateData = async () => {
    setLoading(true);
    
    try {
      // Get affiliate statistics
      const { data: statsData, error: statsError } = await supabase.functions.invoke('affiliate-tracking', {
        body: {
          affiliateId: 'YOUR_AFFILIATE_ID',
          action: 'get_stats'
        }
      });

      if (statsError) {
        console.error('Error loading affiliate stats:', statsError);
      } else {
        setStats(statsData);
      }

      // Get affiliate earnings breakdown
      const { data: earningsData, error: earningsError } = await supabase.functions.invoke('income-affiliate', {
        body: {
          action: 'calculate_earnings',
          data: {
            affiliateId: 'YOUR_AFFILIATE_ID',
            timeframe: 'monthly'
          }
        }
      });

      if (earningsError) {
        console.error('Error loading earnings:', earningsError);
      } else {
        setEarnings(earningsData);
      }

    } catch (error) {
      console.error('Error loading affiliate data:', error);
      toast({
        title: "Loading Error",
        description: "Failed to load affiliate dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayoutRequest = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('income-affiliate', {
        body: {
          action: 'process_payout',
          data: {
            affiliateId: 'YOUR_AFFILIATE_ID',
            amount: earnings?.earnings?.total || 0,
            paymentMethod: 'bitcoin'
          }
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Payout Requested",
        description: `Payout of $${earnings?.earnings?.total || 0} has been requested and is being processed.`,
      });

    } catch (error) {
      console.error('Error requesting payout:', error);
      toast({
        title: "Payout Error",
        description: "Failed to process payout request",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading affiliate dashboard...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-green-500" />
            Affiliate Revenue Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="payouts">Payouts</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Clicks</p>
                        <p className="text-2xl font-bold">{stats?.totalClicks || 0}</p>
                      </div>
                      <MousePointer className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Conversions</p>
                        <p className="text-2xl font-bold">{stats?.totalConversions || 0}</p>
                      </div>
                      <ShoppingCart className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Commission</p>
                        <p className="text-2xl font-bold">${stats?.totalCommission || '0.00'}</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Conversion Rate</p>
                        <p className="text-2xl font-bold">{stats?.conversionRate || '0%'}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {earnings && (
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Earnings Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-700">Base Earnings</p>
                        <p className="text-xl font-bold text-green-900">${earnings.earnings?.base || '0.00'}</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">Bonus Earnings</p>
                        <p className="text-xl font-bold text-blue-900">${earnings.earnings?.bonus || '0.00'}</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm text-purple-700">Total Earnings</p>
                        <p className="text-xl font-bold text-purple-900">${earnings.earnings?.total || '0.00'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Services</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats?.topPerformingServices ? (
                    <div className="space-y-3">
                      {stats.topPerformingServices.map((service, index) => (
                        <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                          <div>
                            <p className="font-semibold">{service.name}</p>
                            <p className="text-sm text-muted-foreground">{service.conversions} conversions</p>
                          </div>
                          <p className="font-bold text-green-600">${service.commission}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No performance data available yet</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payouts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Payout Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Available for Payout:</span>
                      <span className="text-lg font-bold">${earnings?.earnings?.total || '0.00'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Minimum Payout:</span>
                      <span className="text-sm">$50.00</span>
                    </div>
                  </div>

                  <Button 
                    onClick={handlePayoutRequest}
                    className="w-full"
                    disabled={!earnings?.earnings?.total || earnings.earnings.total < 50}
                  >
                    Request Payout via Bitcoin
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Payouts are processed within 24 hours via Bitcoin to your registered wallet address.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AffiliateDashboard;
