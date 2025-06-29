
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StripePaymentIntent from '@/components/StripePaymentIntent';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const PaymentIntentPage: React.FC = () => {
  const navigate = useNavigate();
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState<string>('');

  const handlePaymentSuccess = (intentId: string) => {
    setPaymentIntentId(intentId);
    setPaymentCompleted(true);
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
  };

  if (paymentCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="container mx-auto max-w-2xl space-y-6">
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate('/')} variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <h1 className="text-3xl font-bold text-green-600">Payment Successful!</h1>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-green-600 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold mb-2">Thank you for your payment!</h2>
            <p className="text-muted-foreground mb-4">
              Your payment has been processed successfully.
            </p>
            <p className="text-sm text-muted-foreground">
              Payment Intent ID: {paymentIntentId}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-4">
          <Button onClick={() => navigate('/')} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-primary">Stripe Payment Intent</h1>
        </div>
        
        <div className="text-center mb-6">
          <p className="text-muted-foreground">
            Complete your payment using Stripe's secure payment form
          </p>
        </div>

        <StripePaymentIntent
          amount={2999} // $29.99 in cents
          description="Premium Service Payment"
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      </div>
    </div>
  );
};

export default PaymentIntentPage;
