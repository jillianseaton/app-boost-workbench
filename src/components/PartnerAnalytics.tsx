
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  DollarSign, 
  MousePointer, 
  ShoppingCart,
  BarChart3,
  PieChart
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PartnerAnalytics {
  categoryPerformance: Array<{
    category: string;
    clicks: number;
    conversions: number;
    commission: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    clicks: number;
    conversions: number;
    commission: number;
  }>;
  topPerformingServices: Array<{
    name: string;
    conversions: number;
    commission: number;
    partnerType: string;
  }>;
}

const PartnerAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<PartnerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('affiliate-tracking', {
        body: {
          affiliateId: 'YOUR_AFFILIATE_ID',
          action: 'get_stats'
        }
      });

      if (error) {
        console.error('Error loading analytics:', error);
      } else {
        setAnalytics({
          categoryPerformance: data.categoryPerformance || [],
          monthlyTrend: data.monthlyTrend || [],
          topPerformingServices: data.topPerformingServices || []
        });
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-blue-500" />
          Partner Performance Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="categories" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="categories">By Category</TabsTrigger>
            <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
            <TabsTrigger value="partners">Top Partners</TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics?.categoryPerformance.map((category, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">{category.category}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Clicks:</span>
                        <span className="font-medium">{category.clicks}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Conversions:</span>
                        <span className="font-medium">{category.conversions}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Commission:</span>
                        <span className="font-medium text-green-600">${category.commission}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Rate:</span>
                        <span className="font-medium">
                          {((category.conversions / category.clicks) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analytics?.monthlyTrend.map((month, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-3">{month.month} Performance</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <MousePointer className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                        <p className="text-sm text-gray-600">Clicks</p>
                        <p className="font-bold">{month.clicks}</p>
                      </div>
                      <div className="text-center">
                        <ShoppingCart className="h-5 w-5 mx-auto mb-1 text-green-500" />
                        <p className="text-sm text-gray-600">Conversions</p>
                        <p className="font-bold">{month.conversions}</p>
                      </div>
                      <div className="text-center">
                        <DollarSign className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
                        <p className="text-sm text-gray-600">Commission</p>
                        <p className="font-bold">${month.commission}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="partners" className="space-y-4">
            <div className="space-y-3">
              {analytics?.topPerformingServices.map((partner, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">{partner.name}</h4>
                        <p className="text-sm text-gray-600 capitalize">{partner.partnerType}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">${partner.commission}</p>
                        <p className="text-sm text-gray-600">{partner.conversions} conversions</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PartnerAnalytics;
