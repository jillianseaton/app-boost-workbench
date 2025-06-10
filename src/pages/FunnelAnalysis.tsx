
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, TrendingUp, Users, ArrowRight } from 'lucide-react';

const FunnelAnalysis = () => {
  const funnelSteps = [
    { name: 'Landing Page Visit', users: 10000, conversionRate: 100, dropOff: 0 },
    { name: 'Product Page View', users: 7500, conversionRate: 75, dropOff: 25 },
    { name: 'Add to Cart', users: 3750, conversionRate: 37.5, dropOff: 50 },
    { name: 'Checkout Started', users: 2250, conversionRate: 22.5, dropOff: 40 },
    { name: 'Payment Info Added', users: 1800, conversionRate: 18, dropOff: 20 },
    { name: 'Purchase Completed', users: 1350, conversionRate: 13.5, dropOff: 25 }
  ];

  const getFunnelColor = (index: number, total: number) => {
    const intensity = ((total - index) / total) * 100;
    if (intensity >= 80) return 'bg-green-500';
    if (intensity >= 60) return 'bg-blue-500';
    if (intensity >= 40) return 'bg-yellow-500';
    if (intensity >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="container mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Funnel Analysis</h1>
          <p className="text-muted-foreground">Identify conversion bottlenecks and optimization opportunities</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overall Conversion Rate</p>
                  <p className="text-2xl font-bold text-blue-600">13.5%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Biggest Drop-off</p>
                  <p className="text-2xl font-bold text-red-600">50%</p>
                  <p className="text-xs text-muted-foreground">Product → Cart</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Conversions</p>
                  <p className="text-2xl font-bold text-green-600">1,350</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {funnelSteps.map((step, index) => (
                <div key={index} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${getFunnelColor(index, funnelSteps.length)}`}></div>
                      <span className="font-medium">{step.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        {step.users.toLocaleString()} users
                      </span>
                      <Badge variant={step.dropOff > 30 ? 'destructive' : 'secondary'}>
                        {step.conversionRate}%
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <Progress value={step.conversionRate} className="h-8" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {step.users.toLocaleString()} users ({step.conversionRate}%)
                      </span>
                    </div>
                  </div>

                  {index < funnelSteps.length - 1 && step.dropOff > 0 && (
                    <div className="flex items-center justify-end mt-1">
                      <span className="text-xs text-red-600 flex items-center gap-1">
                        <TrendingDown className="h-3 w-3" />
                        {step.dropOff}% drop-off
                      </span>
                    </div>
                  )}

                  {index < funnelSteps.length - 1 && (
                    <div className="flex justify-center my-2">
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Optimization Opportunities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="font-semibold text-red-800">Critical Issue</span>
                </div>
                <p className="text-sm text-red-700 mb-2">50% drop-off from Product Page to Cart</p>
                <p className="text-xs text-red-600">Optimize: Add to cart button visibility, product images, reviews</p>
              </div>

              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-orange-600" />
                  <span className="font-semibold text-orange-800">High Priority</span>
                </div>
                <p className="text-sm text-orange-700 mb-2">40% drop-off from Cart to Checkout</p>
                <p className="text-xs text-orange-600">Optimize: Reduce form fields, show security badges, guest checkout</p>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-yellow-600" />
                  <span className="font-semibold text-yellow-800">Medium Priority</span>
                </div>
                <p className="text-sm text-yellow-700 mb-2">25% drop-off from Payment to Purchase</p>
                <p className="text-xs text-yellow-600">Optimize: Payment methods, loading indicators, error handling</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommended Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">A/B Test Product Page CTA</h4>
                <p className="text-sm text-blue-700 mb-2">
                  Test different button colors, sizes, and copy to improve cart conversion
                </p>
                <Badge className="bg-blue-100 text-blue-800">Potential +15% uplift</Badge>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Simplify Checkout Flow</h4>
                <p className="text-sm text-green-700 mb-2">
                  Reduce checkout steps from 4 to 2 and add progress indicator
                </p>
                <Badge className="bg-green-100 text-green-800">Potential +20% uplift</Badge>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">Add Trust Signals</h4>
                <p className="text-sm text-purple-700 mb-2">
                  Include customer reviews, security badges, and testimonials
                </p>
                <Badge className="bg-purple-100 text-purple-800">Potential +10% uplift</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FunnelAnalysis;
