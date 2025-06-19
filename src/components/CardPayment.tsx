
import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
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
import { stripeService, PaymentItem } from '@/services/stripeService';
import { CreditCard } from 'lucide-react';

const stripePromise = loadStripe('pk_live_51RBGS0K9RLxvHin2BAeEEZasJJp3IHcwM2QCBIksHEUaDa1GC5MDwwGYbMDejH2Pa9y6ZXvCdoDGTPIEqvmqhcr500r2MxBFkC');

interface CardPaymentProps {
  items: PaymentItem[];
  description?: string;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
}

const CardPaymentForm: React.FC<CardPaymentProps> = ({ 
  items, 
  description = "Card Payment", 
  onSuccess, 
  onError 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  // Calculate total amount (matching Ruby calculate_order_amount)
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

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
      // Create payment intent using items array (matching Ruby implementation)
      const response = await stripeService.createPaymentIntent({
        items,
        description,
        customerEmail: email,
      });

      if (!response.success || !response.clientSecret) {
        throw new Error(response.error || 'Failed to create payment intent');
      }

      // Confirm card payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(response.clientSecret, {
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
          description: `Card payment of $${(totalAmount / 100).toFixed(2)} completed successfully.`,
        });
        onSuccess?.(paymentIntent.id);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Card payment failed';
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

      <div className="text-sm text-muted-foreground">
        Total: ${(totalAmount / 100).toFixed(2)}
      </div>

      <Button 
        type="submit" 
        disabled={!stripe || loading} 
        className="w-full"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Processing...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>Pay ${(totalAmount / 100).toFixed(2)}</span>
          </div>
        )}
      </Button>
    </form>
  );
};

const CardPayment: React.FC<CardPaymentProps> = (props) => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Card Payment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Elements stripe={stripePromise}>
          <CardPaymentForm {...props} />
        </Elements>
      </CardContent>
    </Card>
  );
};

export default CardPayment;
