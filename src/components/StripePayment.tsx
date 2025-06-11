import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, ArrowLeft } from 'lucide-react';

interface StripePaymentProps {
  onBack?: () => void;
  amount: number;
  description: string;
}

const StripePayment: React.FC<StripePaymentProps> = ({ onBack, amount, description }) => {
  const [stripe, setStripe] = useState<any>(null);
  const [elements, setElements] = useState<any>(null);
  const [paymentElement, setPaymentElement] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>('');
  const { toast } = useToast();

  // Load Stripe script
  useEffect(() => {
    const loadStripe = async () => {
      if (!window.Stripe) {
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/';
        script.async = true;
        document.head.appendChild(script);
        
        script.onload = () => {
          const stripeInstance = window.Stripe('pk_live_51RBGS0K9RLxvHin2BAeEEZasJJp3IHcwM2QCBIksHEUaDa1GC5MDwwGYbMDejH2Pa9y6ZXvCdoDGTPIEqvmqhcr500r2MxBFkC');
          setStripe(stripeInstance);
        };
      } else {
        const stripeInstance = window.Stripe('pk_live_51RBGS0K9RLxvHin2BAeEEZasJJp3IHcwM2QCBIksHEUaDa1GC5MDwwGYbMDejH2Pa9y6ZXvCdoDGTPIEqvmqhcr500r2MxBFkC');
        setStripe(stripeInstance);
      }
    };

    loadStripe();
  }, []);

  // Create payment intent and get client secret
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        // You would call your backend to create a payment intent
        // For now, this is a placeholder
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: amount * 100, // Convert to cents
            description,
          }),
        });

        const { client_secret } = await response.json();
        setClientSecret(client_secret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        toast({
          title: "Payment Setup Failed",
          description: "Unable to initialize payment. Please try again.",
          variant: "destructive",
        });
      }
    };

    if (amount > 0) {
      createPaymentIntent();
    }
  }, [amount, description, toast]);

  // Initialize Stripe Elements
  useEffect(() => {
    if (stripe && clientSecret) {
      const elementsInstance = stripe.elements({
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#3b82f6',
          },
        },
      });

      const paymentElementInstance = elementsInstance.create('payment');
      setElements(elementsInstance);
      setPaymentElement(paymentElementInstance);

      // Mount the payment element
      setTimeout(() => {
        paymentElementInstance.mount('#payment-element');
      }, 100);
    }
  }, [stripe, clientSecret]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      toast({
        title: "Payment Not Ready",
        description: "Please wait for the payment form to load.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message || "An error occurred during payment.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Successful",
          description: "Your payment has been processed successfully.",
        });
      }
    } catch (err) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
            <p className="text-muted-foreground">{description}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Payment Summary */}
            <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Amount:</span>
                <span className="text-2xl font-bold text-primary">${amount.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Payment Information</label>
                <div 
                  id="payment-element" 
                  className="p-4 border border-input rounded-md bg-background"
                >
                  {!clientSecret && (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span className="ml-2 text-muted-foreground">Loading payment form...</span>
                    </div>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={!stripe || !elements || isLoading || !clientSecret}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing Payment...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Pay ${amount.toFixed(2)}</span>
                  </div>
                )}
              </Button>
            </form>

            {/* Security Notice */}
            <div className="text-xs text-muted-foreground text-center">
              <p>🔒 Your payment information is encrypted and secure</p>
              <p>Powered by Stripe - Industry standard security</p>
            </div>
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
