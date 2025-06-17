
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Settings } from 'lucide-react';
import PartnerHeader from './PartnerHeader';
import PartnerAnalyticsCards from './PartnerAnalyticsCards';
import PartnerApiAccess from './PartnerApiAccess';
import PartnerPaymentsList from './PartnerPaymentsList';

interface PartnerDashboardProps {
  partnerId: string;
  partnerData: {
    name: string;
    email: string;
    status: 'pending' | 'approved' | 'suspended';
    apiKey: string;
    createdAt: string;
  };
}

const PartnerDashboard: React.FC<PartnerDashboardProps> = ({ partnerId, partnerData }) => {
  // Mock data for demonstration
  const analytics = {
    totalPayments: 15420.50,
    thisMonth: 3240.75,
    successfulRequests: 1243,
    failedRequests: 12,
  };

  const recentPayments = [
    {
      id: 'pay_1',
      amount: 450.00,
      campaign: 'Summer Sale Campaign',
      status: 'completed',
      date: '2024-01-15',
    },
    {
      id: 'pay_2',
      amount: 320.50,
      campaign: 'Brand Awareness Q1',
      status: 'pending',
      date: '2024-01-14',
    },
  ];

  const apiEndpoints = [
    { method: 'POST', path: '/payments', description: 'Submit payment' },
    { method: 'GET', path: '/payments', description: 'List payments' },
    { method: 'GET', path: '/analytics', description: 'Get analytics' },
    { method: 'POST', path: '/webhooks', description: 'Configure webhooks' },
  ];

  return (
    <div className="space-y-6">
      <PartnerHeader partnerName={partnerData.name} status={partnerData.status} />
      
      <PartnerAnalyticsCards analytics={analytics} />

      <Tabs defaultValue="api" className="space-y-4">
        <TabsList>
          <TabsTrigger value="api">API Access</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="api" className="space-y-4">
          <PartnerApiAccess apiKey={partnerData.apiKey} apiEndpoints={apiEndpoints} />
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <PartnerPaymentsList payments={recentPayments} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Advanced analytics dashboard coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Account settings panel coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PartnerDashboard;
