
import React from 'react';
import Dashboard from '@/components/Dashboard';
import AdSenseUnit from '@/components/ads/AdSenseUnit';
import { useAdTracking } from '@/hooks/useAdTracking';

const DashboardPage: React.FC = () => {
  const { trackImpression, trackClick } = useAdTracking();

  const handleMultiplexAdImpression = () => {
    trackImpression({
      adSlot: '3941685758',
      placementId: 'dashboard_multiplex',
      adType: 'multiplex'
    });
  };

  const handleMultiplexAdClick = () => {
    trackClick({
      adSlot: '3941685758',
      placementId: 'dashboard_multiplex',
      adType: 'multiplex'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <Dashboard />
        
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
      </div>
    </div>
  );
};

export default DashboardPage;
