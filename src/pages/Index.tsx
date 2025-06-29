
import React from 'react';
import IndexHeader from '@/components/index/IndexHeader';
import IndexHero from '@/components/index/IndexHero';
import IndexPaymentCTA from '@/components/index/IndexPaymentCTA';
import IndexFeaturedServices from '@/components/index/IndexFeaturedServices';
import IndexDashboardLinks from '@/components/index/IndexDashboardLinks';
import AdSenseUnit from '@/components/ads/AdSenseUnit';
import { useAdTracking } from '@/hooks/useAdTracking';

const Index = () => {
  const { trackImpression, trackClick } = useAdTracking();

  const handleAdImpression1 = () => {
    trackImpression({
      adSlot: '4133257448',
      placementId: 'homepage_hero',
      adType: 'display'
    });
  };

  const handleAdClick1 = () => {
    trackClick({
      adSlot: '4133257448',
      placementId: 'homepage_hero',
      adType: 'display'
    });
  };

  const handleAdImpression2 = () => {
    trackImpression({
      adSlot: '1879193848',
      placementId: 'homepage_middle',
      adType: 'display'
    });
  };

  const handleAdClick2 = () => {
    trackClick({
      adSlot: '1879193848',
      placementId: 'homepage_middle',
      adType: 'display'
    });
  };

  const handleNativeAdImpression = () => {
    trackImpression({
      adSlot: '6567849095',
      placementId: 'homepage_native',
      adType: 'native'
    });
  };

  const handleNativeAdClick = () => {
    trackClick({
      adSlot: '6567849095',
      placementId: 'homepage_native',
      adType: 'native'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <IndexHeader />
      
      <main className="container mx-auto px-4 py-8">
        <IndexHero />
        
        {/* First AdSense Ad Unit */}
        <div className="my-8 flex justify-center">
          <AdSenseUnit
            adSlot="4133257448"
            className="max-w-4xl mx-auto"
            onImpression={handleAdImpression1}
            onAdClick={handleAdClick1}
          />
        </div>
        
        <IndexPaymentCTA />
        
        {/* Native Ad Unit - Fluid Layout */}
        <div className="my-8 flex justify-center">
          <AdSenseUnit
            adSlot="6567849095"
            adFormat="fluid"
            style={{ display: 'block' }}
            className="max-w-4xl mx-auto"
            onImpression={handleNativeAdImpression}
            onAdClick={handleNativeAdClick}
          />
        </div>
        
        {/* Second AdSense Ad Unit */}
        <div className="my-8 flex justify-center">
          <AdSenseUnit
            adSlot="1879193848"
            className="max-w-4xl mx-auto"
            onImpression={handleAdImpression2}
            onAdClick={handleAdClick2}
          />
        </div>
        
        <IndexFeaturedServices />
        <IndexDashboardLinks />
      </main>
    </div>
  );
};

export default Index;
