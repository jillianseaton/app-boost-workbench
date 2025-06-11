
import React from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';

interface StripePaymentFormProps {
  onSubmit: (event: React.FormEvent) => void;
  isLoading: boolean;
  clientSecret: string;
  stripe: any;
  elements: any;
  amount: number;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  onSubmit,
  isLoading,
  clientSecret,
  stripe,
  elements,
  amount,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
  );
};

export default StripePaymentForm;
