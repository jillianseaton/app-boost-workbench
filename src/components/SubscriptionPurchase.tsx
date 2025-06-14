
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, CreditCard, Check, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

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
  const { toast } = useToast();
  const { createSubscription } = useAuth();
  const navigate = useNavigate();

  // You should replace this with your actual Stripe price ID
  const OPERATOR_LICENSE_PRICE_ID = "price_1234567890"; // Replace with your actual price ID

  const handleEmbeddedCheckout = () => {
    setIsProcessing(true);
    
    toast({
      title: "Redirecting to Checkout",
      description: "Taking you to the secure payment form...",
    });

    // Navigate to embedded checkout page
    navigate(`/checkout/${OPERATOR_LICENSE_PRICE_ID}`);
  };

  const handleSimulatedPurchase = async () => {
    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Create subscription in database
      await createSubscription();
      
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

            {/* Security Notice */}
            <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <Shield className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-green-800">Secure Payment</p>
                <p className="text-green-700">Your payment information is encrypted and secure. We use industry-standard security measures to protect your data.</p>
              </div>
            </div>

            {/* Payment Options */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Choose Payment Method</h3>
              
              {/* Embedded Checkout Option */}
              <Button
                onClick={handleEmbeddedCheckout}
                disabled={isProcessing}
                size="lg"
                className="w-full"
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span>Pay with Stripe Embedded Checkout - $9.99/month</span>
                </div>
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              {/* Simulated Purchase Option */}
              <Button
                onClick={handleSimulatedPurchase}
                disabled={isProcessing}
                size="lg"
                variant="outline"
                className="w-full"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    <span>Processing Payment...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Simulate Purchase (Demo Mode)</span>
                  </div>
                )}
              </Button>
            </div>

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
