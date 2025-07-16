
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdSenseUnit from '@/components/ads/AdSenseUnit';
import { useAdTracking } from '@/hooks/useAdTracking';

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const { trackImpression, trackClick } = useAdTracking();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Top Ad */}
      <div className="container mx-auto px-4 max-w-2xl mb-6">
        <AdSenseUnit
          adSlot="3954712847"
          adFormat="auto"
          onImpression={() => trackImpression({ adSlot: '3954712847', placementId: 'payment-success-top' })}
          onAdClick={() => trackClick({ adSlot: '3954712847', placementId: 'payment-success-top' })}
        />
      </div>

      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-green-600">
              Payment Successful!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Thank you for your payment to Lovable.dev. Your transaction has been processed successfully 
              and the funds have been deposited into our Stripe account.
            </p>
            
            <p className="text-sm text-gray-500">
              You should receive a confirmation email from Stripe shortly with your payment details.
            </p>

            <div className="pt-4">
              <Button onClick={() => navigate('/')} className="mr-2">
                Return to Dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.close()}
              >
                Close Window
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Ad */}
        <div className="mt-6">
          <AdSenseUnit
            adSlot="7185934621"
            adFormat="auto"
            onImpression={() => trackImpression({ adSlot: '7185934621', placementId: 'payment-success-bottom' })}
            onAdClick={() => trackClick({ adSlot: '7185934621', placementId: 'payment-success-bottom' })}
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
