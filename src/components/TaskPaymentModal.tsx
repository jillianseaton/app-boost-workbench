
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { taskPaymentService } from '@/services/taskPaymentService';
import { CreditCard, Loader2 } from 'lucide-react';

interface TaskPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  taskType: string;
  taskPrice: number;
  userEmail: string;
  userId: string;
}

const TaskPaymentModal: React.FC<TaskPaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentSuccess,
  taskType,
  taskPrice,
  userEmail,
  userId,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [stripe, setStripe] = useState<any>(null);
  const [elements, setElements] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState<string>('');
  const { toast } = useToast();

  // Load Stripe
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

    if (isOpen) {
      loadStripe();
    }
  }, [isOpen]);

  // Create payment intent when modal opens
  useEffect(() => {
    const createPaymentIntent = async () => {
      if (!isOpen || !taskPrice) return;
      
      setIsLoading(true);
      try {
        const response = await taskPaymentService.createTaskPayment({
          taskType,
          amount: taskPrice,
          description: `Optimization Task: ${taskType}`,
          userId,
          userEmail,
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
        onClose();
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [isOpen, taskPrice, taskType, userId, userEmail, toast, onClose]);

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

      const paymentElement = elementsInstance.create('payment', {
        paymentMethodTypes: ['card']
      });
      setElements(elementsInstance);

      // Mount the payment element
      setTimeout(() => {
        paymentElement.mount('#task-payment-element');
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
          return_url: `${window.location.origin}/`,
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
          description: `Task payment of $${taskPrice.toFixed(2)} completed successfully!`,
        });
        
        onPaymentSuccess();
        onClose();
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Pay for Optimization Task
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900">Task Details</h3>
            <p className="text-blue-700">Type: {taskType}</p>
            <p className="text-blue-700">Price: ${taskPrice.toFixed(2)}</p>
          </div>

          {clientSecret ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Payment Information</label>
                <div 
                  id="task-payment-element" 
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

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!stripe || !elements || isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <span>Pay ${taskPrice.toFixed(2)}</span>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Setting up payment...</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskPaymentModal;
