
import React from 'react';
import CommissionDashboard from '@/components/CommissionDashboard';
import AdSenseUnit from '@/components/ads/AdSenseUnit';
import { useAuth } from '@/hooks/useAuth';
import { useAdTracking } from '@/hooks/useAdTracking';

const PayoutIntegrationPage: React.FC = () => {
  const { user } = useAuth();
  const { trackImpression, trackClick } = useAdTracking();

  const handleMultiplexAdImpression = () => {
    trackImpression({
      adSlot: '3941685758',
      placementId: 'payout_multiplex',
      adType: 'multiplex'
    });
  };

  const handleMultiplexAdClick = () => {
    trackClick({
      adSlot: '3941685758',
      placementId: 'payout_multiplex',
      adType: 'multiplex'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Commission Payout Dashboard
          </h1>
          <p className="text-gray-600">
            View your earnings and request payouts from your commission balance
          </p>
        </div>
        
        {user ? (
          <>
            <CommissionDashboard userId={user.id} />
            
            {/* Multiplex Ad Unit */}
            <div className="my-8 flex justify-center">
              <AdSenseUnit
                adSlot="3941685758"
                adFormat="autorelaxed"
                style={{ display: 'block' }}
                className="max-w-4xl mx-auto"
                onImpression={handleMultiplexAdImpression}
                onAdClick={handleMultiplexAdClick}
              />
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">Please sign in to view your payout dashboard.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayoutIntegrationPage;
