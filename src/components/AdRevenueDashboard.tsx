
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, TrendingUp, Users, Calendar } from 'lucide-react';
import AdRevenueStats from './ad-revenue/AdRevenueStats';
import PaymentHistory from './ad-revenue/PaymentHistory';
import PartnerManagement from './ad-revenue/PartnerManagement';
import PayoutSchedule from './ad-revenue/PayoutSchedule';
import ConnectAccountSetup from './ad-revenue/ConnectAccountSetup';

const AdRevenueDashboard: React.FC = () => {
  const [connectAccountId, setConnectAccountId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="container mx-auto max-w-7xl space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">Ad Revenue Management</h1>
          <p className="text-muted-foreground">Manage payments from advertising partners and track your revenue</p>
        </div>

        {!connectAccountId ? (
          <ConnectAccountSetup onAccountCreated={setConnectAccountId} />
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="payments">Payment History</TabsTrigger>
              <TabsTrigger value="partners">Partners</TabsTrigger>
              <TabsTrigger value="payouts">Payouts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <AdRevenueStats connectAccountId={connectAccountId} />
            </TabsContent>
            
            <TabsContent value="payments">
              <PaymentHistory connectAccountId={connectAccountId} />
            </TabsContent>
            
            <TabsContent value="partners">
              <PartnerManagement connectAccountId={connectAccountId} />
            </TabsContent>
            
            <TabsContent value="payouts">
              <PayoutSchedule connectAccountId={connectAccountId} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default AdRevenueDashboard;
