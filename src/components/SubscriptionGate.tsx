
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Star, CreditCard, LogOut } from 'lucide-react';

interface User {
  phoneNumber: string;
  username: string;
}

interface SubscriptionGateProps {
  user: User;
  onPurchase: () => void;
  onLogout: () => void;
}

const SubscriptionGate: React.FC<SubscriptionGateProps> = ({ user, onPurchase, onLogout }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">EarnFlow</h1>
            <p className="text-lg text-muted-foreground">Welcome back, {user.username}!</p>
          </div>
          <Button onClick={onLogout} variant="outline" className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Subscription Required Card */}
        <Card className="border-2 border-orange-200 bg-orange-50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Lock className="h-6 w-6 text-orange-600" />
            </div>
            <CardTitle className="text-2xl text-orange-800">Subscription Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-orange-700">
              To access the EarnFlow platform and start earning, you need an active operator license subscription.
            </p>
            
            <div className="bg-white p-6 rounded-lg border border-orange-200">
              <h3 className="text-xl font-semibold mb-4">EarnFlow Operator License</h3>
              <div className="text-3xl font-bold text-primary mb-2">$9.99/month</div>
              <p className="text-sm text-muted-foreground mb-4">
                Monthly subscription to operate on the EarnFlow platform
              </p>
              <ul className="text-left space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-green-500" />
                  Access to all optimization tasks
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-green-500" />
                  5% commission on all completed tasks
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-green-500" />
                  Daily withdrawal to Bitcoin wallet
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-green-500" />
                  24/7 platform access
                </li>
              </ul>
            </div>

            <Button 
              onClick={onPurchase}
              size="lg" 
              className="w-full md:w-auto px-12 py-6 text-xl"
            >
              <CreditCard className="h-5 w-5 mr-2" />
              Purchase Operator License
            </Button>

            <p className="text-sm text-muted-foreground">
              Secure payment processing • Cancel anytime • No hidden fees
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionGate;
