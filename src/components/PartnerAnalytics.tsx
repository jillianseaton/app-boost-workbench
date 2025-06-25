
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, Users, Calendar, Clock, CheckCircle } from 'lucide-react';

const PartnerAnalytics = () => {
  const analytics = [
    {
      title: "Total Revenue",
      value: "$24,567.89",
      change: "+12.5%",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Active Partners",
      value: "48",
      change: "+8.3%",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Monthly Growth",
      value: "15.2%",
      change: "+2.1%",
      icon: TrendingUp,
      color: "text-purple-600"
    },
    {
      title: "Daily Payouts",
      value: "24/7",
      change: "Processing",
      icon: Clock,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {analytics.map((item, index) => {
          const Icon = item.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{item.title}</p>
                    <p className="text-2xl font-bold">{item.value}</p>
                    <p className={`text-xs ${item.color}`}>{item.change}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${item.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Our Payout Model
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Daily Payout Processing</p>
                <p className="text-sm text-green-700">Automated daily transfers to your account</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Processing Schedule:</span>
                <Badge className="bg-blue-100 text-blue-800">Every 24 Hours</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Minimum Payout:</span>
                <span className="text-sm font-semibold">$10.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Payment Method:</span>
                <span className="text-sm">Stripe Transfer</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Processing Time:</span>
                <span className="text-sm">1-3 Business Days</span>
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Daily Processing:</strong> Earnings are automatically processed and transferred to your 
                connected Stripe account every day at 6 PM EST, provided you've reached the minimum payout threshold.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Payout Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { date: "Today", amount: "$245.67", status: "Processing", color: "bg-yellow-100 text-yellow-800" },
                { date: "Yesterday", amount: "$189.34", status: "Completed", color: "bg-green-100 text-green-800" },
                { date: "Jan 23", amount: "$298.12", status: "Completed", color: "bg-green-100 text-green-800" },
                { date: "Jan 22", amount: "$156.89", status: "Completed", color: "bg-green-100 text-green-800" },
              ].map((payout, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{payout.amount}</p>
                      <p className="text-sm text-muted-foreground">{payout.date}</p>
                    </div>
                  </div>
                  <Badge className={payout.color}>{payout.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PartnerAnalytics;
