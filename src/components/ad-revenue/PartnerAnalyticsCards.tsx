
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AnalyticsData {
  totalPayments: number;
  thisMonth: number;
  successfulRequests: number;
  failedRequests: number;
}

interface PartnerAnalyticsCardsProps {
  analytics: AnalyticsData;
}

const PartnerAnalyticsCards: React.FC<PartnerAnalyticsCardsProps> = ({ analytics }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${analytics.totalPayments.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">All time</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${analytics.thisMonth.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">+15% from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">API Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.successfulRequests}</div>
          <p className="text-xs text-muted-foreground">Successful</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{((analytics.failedRequests / (analytics.successfulRequests + analytics.failedRequests)) * 100).toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">Last 30 days</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PartnerAnalyticsCards;
