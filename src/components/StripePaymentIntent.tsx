
import React, { useState, useEffect } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const stripePromise = loadStripe('pk_live_51RZkCqGIoraPHMELZURKQITI8fcY0NseoxLJRUwOEf5PO3YdzeuNhMrO4Wq2jO4tR8UU6GyTtaWkYgN4ueSms6kx00ypdzNAsl');

interface PaymentIntentFormProps {
  clientSecret: string;
  amount: number;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
}

const PaymentIntentForm: React.FC<PaymentIntentFormProps> = ({
  clientSecret,
  amount,
  onSuccess,
  onError
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required'
      });

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
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
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Payment Details</Label>
        <div className="p-3 border rounded-md">
          <PaymentElement
            options={{
              layout: 'tabs'
            }}
          />
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Total: ${(amount / 100).toFixed(2)}
      </div>

      <Button 
        type="submit" 
        disabled={!stripe || !elements || isLoading} 
        className="w-full"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Processing Payment...</span>
          </div>
        ) : (
          <span>Pay ${(amount / 100).toFixed(2)}</span>
        )}
      </Button>
    </form>
  );
};

interface StripePaymentIntentProps {
  amount: number; // Amount in cents
  description?: string;
  customerEmail?: string;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
}

const StripePaymentIntent: React.FC<StripePaymentIntentProps> = ({
  amount,
  description = "Payment",
  customerEmail,
  onSuccess,
  onError
}) => {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState(customerEmail || '');
  const { toast } = useToast();

  useEffect(() => {
    createPaymentIntent();
  }, [amount, description]);

  const createPaymentIntent = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          items: [{ amount }],
          description,
          customerEmail: email
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.success || !data?.clientSecret) {
        throw new Error(data?.error || 'Failed to create payment intent');
      }

      setClientSecret(data.clientSecret);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize payment';
      toast({
        title: "Payment Setup Failed",
        description: errorMessage,
        variant: "destructive",
      });
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const elementsOptions: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#3b82f6',
      },
    },
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Setting up payment...</span>
        </CardContent>
      </Card>
    );
  }

  if (!clientSecret) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <span className="text-red-600">Failed to initialize payment</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-4">
          <div>
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
        </div>
        
        <Elements stripe={stripePromise} options={elementsOptions}>
          <PaymentIntentForm
            clientSecret={clientSecret}
            amount={amount}
            onSuccess={onSuccess}
            onError={onError}
          />
        </Elements>
      </CardContent>
    </Card>
  );
};

export default StripePaymentIntent;
