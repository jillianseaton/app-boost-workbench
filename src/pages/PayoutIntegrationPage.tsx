
import React from 'react';
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
            Payout Dashboard
          </h1>
          <p className="text-gray-600">
            Commission payout functionality has been removed
          </p>
        </div>
        
        {user ? (
          <>
            {/* Multiplex Ad Unit */}
            <div className="my-8 w-full flex justify-center px-4">
              <AdSenseUnit
                adSlot="3941685758"
                adFormat="autorelaxed"
                className="w-full"
                style={{ display: 'block' }}
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
