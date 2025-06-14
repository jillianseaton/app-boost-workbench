import React, { useState, useEffect } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { stripeService } from '@/services/stripeService';
import { ArrowLeft } from 'lucide-react';

const stripePromise = loadStripe('pk_live_51RBGS0K9RLxvHin2BAeEEZasJJp3IHcwM2QCBIksHEUaDa1GC5MDwwGYbMDejH2Pa9y6ZXvCdoDGTPIEqvmqhcr500r2MxBFkC');

interface StripePaymentProps {
  amount: number;
  description?: string;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
  onBack?: () => void;
}

const PaymentForm: React.FC<StripePaymentProps> = ({ amount, description = "Payment", onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      return;
    }

    setLoading(true);

    try {
      // Create payment intent
      const response = await stripeService.createPaymentIntent({
        amount,
        description,
        customerEmail: email,
      });

      if (!response.success || !response.data?.clientSecret) {
        throw new Error(response.error || 'Failed to create payment intent');
      }

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(response.data.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            email: email,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent.status === 'succeeded') {
        toast({
          title: "Payment Successful",
          description: `Payment of $${(amount / 100).toFixed(2)} completed successfully.`,
        });
        onSuccess?.(paymentIntent.id);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive",
      });
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label>Card Details</Label>
        <div className="p-3 border rounded-md">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
              },
            }}
          />
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={!stripe || loading} 
        className="w-full"
      >
        {loading ? 'Processing...' : `Pay $${(amount / 100).toFixed(2)}`}
      </Button>
    </form>
  );
};

const StripePayment: React.FC<StripePaymentProps> = (props) => {
  const options: StripeElementsOptions = {
    mode: 'payment',
    amount: props.amount,
    currency: 'usd',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-2xl space-y-6">
        {props.onBack && (
          <div className="flex items-center gap-4">
            <Button onClick={props.onBack} variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-primary">Payment</h1>
          </div>
        )}
        
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise} options={options}>
              <PaymentForm {...props} />
            </Elements>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StripePayment;
