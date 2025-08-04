import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { railwayBackendService } from '@/services/railwayBackendService';
import { Loader2, ExternalLink } from 'lucide-react';

interface RailwayBackendPaymentProps {
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
}

const RailwayBackendPayment: React.FC<RailwayBackendPaymentProps> = ({
  onSuccess,
  onError
}) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: "Missing Description",
        description: "Please enter a description for the payment",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await railwayBackendService.createCheckoutSession({
        amount: Math.round(parseFloat(amount) * 100), // Convert to cents
        description: description.trim(),
        successUrl: `${window.location.origin}/payment-success`,
        cancelUrl: `${window.location.origin}/dashboard`,
        customerEmail: customerEmail || undefined,
        mode: 'payment'
      });

      if (response.success && response.data?.url) {
        toast({
          title: "Checkout Session Created",
          description: "Redirecting to payment page...",
        });
        
        // Redirect to Stripe checkout
        window.location.href = response.data.url;
        onSuccess?.(response.data.url);
      } else {
        throw new Error(response.error || 'Failed to create checkout session');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment setup failed';
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

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Railway Backend Payment
          <ExternalLink className="h-4 w-4" />
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Create a payment using the Railway backend service
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount">Amount (USD)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.50"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="10.00"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this payment for?"
              required
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="email">Customer Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="customer@example.com"
            />
          </div>

          <Button 
            type="submit" 
            disabled={isLoading} 
            className="w-full"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creating Checkout...</span>
              </div>
            ) : (
              <span>Create Payment Checkout</span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RailwayBackendPayment;