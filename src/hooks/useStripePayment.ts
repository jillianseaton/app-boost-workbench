
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { stripeService } from '@/services/stripeService';

interface UseStripePaymentProps {
  amount: number;
  description: string;
}

export const useStripePayment = ({ amount, description }: UseStripePaymentProps) => {
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

  // Create payment intent and get client secret using backend
  useEffect(() => {
    const createPaymentIntent = async () => {
      if (!amount) return;
      
      setIsLoading(true);
      try {
        const response = await stripeService.createPaymentIntent({
          amount: Math.round(amount * 100), // Convert to cents
          description,
        });

        if (!response.success || !response.data?.clientSecret) {
          throw new Error(response.error || 'Failed to create payment intent');
        }
        
        setClientSecret(response.data.clientSecret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        toast({
          title: "Payment Setup Failed",
          description: error instanceof Error ? error.message : "Unable to initialize payment. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
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
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
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
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast({
          title: "Payment Successful",
          description: "Your payment has been processed successfully.",
        });
        
        // Verify the payment using backend
        try {
          const verification = await stripeService.verifyPayment(paymentIntent.id);
          console.log('Payment verification:', verification);
        } catch (verifyError) {
          console.warn('Payment verification failed:', verifyError);
        }
        
        // Redirect to success page
        window.location.href = `${window.location.origin}/payment-success`;
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

  return {
    stripe,
    elements,
    isLoading,
    clientSecret,
    handleSubmit,
  };
};
