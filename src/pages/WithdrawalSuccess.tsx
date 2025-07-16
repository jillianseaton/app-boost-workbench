
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import AdSenseUnit from '@/components/ads/AdSenseUnit';
import { useAdTracking } from '@/hooks/useAdTracking';

const WithdrawalSuccess = () => {
  const navigate = useNavigate();
  const { trackImpression, trackClick } = useAdTracking();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Top Ad */}
        <AdSenseUnit
          adSlot="5827496314"
          adFormat="auto"
          onImpression={() => trackImpression({ adSlot: '5827496314', placementId: 'withdrawal-success' })}
          onAdClick={() => trackClick({ adSlot: '5827496314', placementId: 'withdrawal-success' })}
        />

        <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center space-y-4">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <h1 className="text-2xl font-bold text-gray-900">Withdrawal Successful!</h1>
          <p className="text-gray-600">
            Your withdrawal has been processed successfully. Funds will arrive in your bank account within 1-2 business days.
          </p>
          <Button 
            onClick={() => navigate('/')} 
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to Dashboard
          </Button>
        </CardContent>
        </Card>

        {/* Bottom Ad */}
        <AdSenseUnit
          adSlot="4192857643"
          adFormat="auto"
          onImpression={() => trackImpression({ adSlot: '4192857643', placementId: 'withdrawal-success-bottom' })}
          onAdClick={() => trackClick({ adSlot: '4192857643', placementId: 'withdrawal-success-bottom' })}
        />
      </div>
    </div>
  );
};

export default WithdrawalSuccess;
