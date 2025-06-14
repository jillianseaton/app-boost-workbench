
import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const stripePromise = loadStripe('pk_live_51RBGS0K9RLxvHin2BAeEEZasJJp3IHcwM2QCBIksHEUaDa1GC5MDwwGYbMDejH2Pa9y6ZXvCdoDGTPIEqvmqhcr500r2MxBFkC');

interface StripeEmbeddedCheckoutProps {
  priceId: string;
  onBack?: () => void;
  title?: string;
  description?: string;
}

const StripeEmbeddedCheckout: React.FC<StripeEmbeddedCheckoutProps> = ({
  priceId,
  onBack,
  title = "Complete Your Subscription",
  description = "Subscribe to unlock premium features"
}) => {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const createCheckoutSession = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            priceId,
            mode: 'subscription',
            ui_mode: 'embedded',
            return_url: `${window.location.origin}/subscription-success`,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create checkout session');
        }

        const { clientSecret } = await response.json();
        setClientSecret(clientSecret);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize checkout');
      } finally {
        setLoading(false);
      }
    };

    if (priceId) {
      createCheckoutSession();
    }
  }, [priceId]);

  const options = {
    clientSecret,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="container mx-auto max-w-2xl space-y-6">
          {onBack && (
            <div className="flex items-center gap-4">
              <Button onClick={onBack} variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-3xl font-bold text-primary">{title}</h1>
            </div>
          )}
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading checkout...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="container mx-auto max-w-2xl space-y-6">
          {onBack && (
            <div className="flex items-center gap-4">
              <Button onClick={onBack} variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-3xl font-bold text-primary">{title}</h1>
            </div>
          )}
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-2xl space-y-6">
        {onBack && (
          <div className="flex items-center gap-4">
            <Button onClick={onBack} variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-primary">{title}</h1>
          </div>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            {description && <p className="text-muted-foreground">{description}</p>}
          </CardHeader>
          <CardContent>
            <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StripeEmbeddedCheckout;
