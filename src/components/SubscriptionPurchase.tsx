
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, CreditCard, Check, Shield } from 'lucide-react';

interface User {
  phoneNumber: string;
  username: string;
}

interface SubscriptionPurchaseProps {
  user: User;
  onBack: () => void;
  onSuccess: () => void;
}

const SubscriptionPurchase: React.FC<SubscriptionPurchaseProps> = ({ user, onBack, onSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const { toast } = useToast();

  const handleSubscriptionPurchase = async () => {
    if (!cardNumber || !expiryDate || !cvv || !cardName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all payment details.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing - in production this would integrate with Stripe
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Store subscription in localStorage (in production this would be in your database)
      const subscription = {
        userId: user.phoneNumber,
        plan: 'operator-license',
        amount: 9.99,
        currency: 'USD',
        startDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        status: 'active'
      };
      
      localStorage.setItem(`subscription-${user.phoneNumber}`, JSON.stringify(subscription));
      
      toast({
        title: "Subscription Activated!",
        description: "Your EarnFlow Operator License is now active.",
      });
      
      onSuccess();
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-4">
          <Button onClick={onBack} variant="outline" size="sm" disabled={isProcessing}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-primary">Purchase Operator License</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              EarnFlow Operator License
            </CardTitle>
            <p className="text-muted-foreground">Monthly subscription to operate on the EarnFlow platform</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Plan Details */}
            <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Operator License</h3>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">$9.99</div>
                  <div className="text-sm text-muted-foreground">per month</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Access to all optimization tasks</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>5% commission on completed tasks</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Daily withdrawal to Bitcoin wallet</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>24/7 platform access</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Payment Information</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Cardholder Name</label>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    disabled={isProcessing}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Card Number</label>
                  <Input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    maxLength={19}
                    disabled={isProcessing}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Expiry Date</label>
                    <Input
                      type="text"
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                      maxLength={5}
                      disabled={isProcessing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">CVV</label>
                    <Input
                      type="text"
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                      maxLength={4}
                      disabled={isProcessing}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <Shield className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-green-800">Secure Payment</p>
                <p className="text-green-700">Your payment information is encrypted and secure. We use industry-standard security measures to protect your data.</p>
              </div>
            </div>

            {/* Purchase Button */}
            <Button
              onClick={handleSubscriptionPurchase}
              disabled={isProcessing}
              size="lg"
              className="w-full"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing Payment...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span>Purchase License - $9.99/month</span>
                </div>
              )}
            </Button>

            {/* Terms */}
            <p className="text-xs text-muted-foreground text-center">
              By purchasing this subscription, you agree to our Terms of Service and Privacy Policy. 
              Your subscription will automatically renew monthly until cancelled.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionPurchase;
