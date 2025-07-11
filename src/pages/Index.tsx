
import React from 'react';
import { Link } from 'react-router-dom';
import IndexHeader from '@/components/index/IndexHeader';
import IndexHero from '@/components/index/IndexHero';
import IndexPaymentCTA from '@/components/index/IndexPaymentCTA';
import IndexFeaturedServices from '@/components/index/IndexFeaturedServices';
import IndexDashboardLinks from '@/components/index/IndexDashboardLinks';
import AdSenseUnit from '@/components/ads/AdSenseUnit';
import { useAdTracking } from '@/hooks/useAdTracking';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';
import StripePayoutSection from '@/components/StripePayoutSection';
import UserProfile from '@/components/UserProfile';

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

  const handleInArticleAdImpression = () => {
    trackImpression({
      adSlot: '9487572195',
      placementId: 'homepage_in_article',
      adType: 'in-article'
    });
  };

  const handleInArticleAdClick = () => {
    trackClick({
      adSlot: '9487572195',
      placementId: 'homepage_in_article',
      adType: 'in-article'
    });
  };

  const handleMultiplexAdImpression = () => {
    trackImpression({
      adSlot: '3941685758',
      placementId: 'homepage_multiplex',
      adType: 'multiplex'
    });
  };

  const handleMultiplexAdClick = () => {
    trackClick({
      adSlot: '3941685758',
      placementId: 'homepage_multiplex',
      adType: 'multiplex'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <IndexHeader />
      
      <main className="container mx-auto px-4 py-8">
        <IndexHero />
        
        {/* User Profile Section */}
        <div className="my-8 flex justify-center">
          <UserProfile />
        </div>
        
        {/* Payment Intent Demo Link */}
        <div className="my-8 flex justify-center">
          <Link to="/payment-intent">
            <Button className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Try Stripe Payment Intent Demo
            </Button>
          </Link>
        </div>
        
        {/* Stripe Payout Section */}
        <div className="my-8">
          <StripePayoutSection />
        </div>
        
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
        
        {/* In-Article Ad Unit */}
        <div className="my-8 flex justify-center">
          <AdSenseUnit
            adSlot="9487572195"
            adFormat="fluid"
            adLayout="in-article"
            style={{ display: 'block', textAlign: 'center' }}
            className="max-w-4xl mx-auto"
            onImpression={handleInArticleAdImpression}
            onAdClick={handleInArticleAdClick}
          />
        </div>
        
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
        
        {/* Multiplex Ad Unit - Autorelaxed */}
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
