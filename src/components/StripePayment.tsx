
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, ArrowLeft } from 'lucide-react';
import { useStripePayment } from '@/hooks/useStripePayment';
import StripePaymentForm from './StripePaymentForm';
import PaymentSummary from './PaymentSummary';
import SecurityNotice from './SecurityNotice';

interface StripePaymentProps {
  onBack?: () => void;
  amount: number;
  description: string;
}

const StripePayment: React.FC<StripePaymentProps> = ({ onBack, amount, description }) => {
  const { stripe, elements, isLoading, clientSecret, handleSubmit } = useStripePayment({
    amount,
    description,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-2xl space-y-6">
        {onBack && (
          <div className="flex items-center gap-4">
            <Button onClick={onBack} variant="outline" size="sm" disabled={isLoading}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-primary">Secure Payment</h1>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Details
            </CardTitle>
            <PaymentSummary amount={amount} description={description} />
          </CardHeader>
          <CardContent className="space-y-6">
            <StripePaymentForm
              onSubmit={handleSubmit}
              isLoading={isLoading}
              clientSecret={clientSecret}
              stripe={stripe}
              elements={elements}
              amount={amount}
            />

            <SecurityNotice />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Add Stripe to window type
declare global {
  interface Window {
    Stripe: any;
  }
}

export default StripePayment;
