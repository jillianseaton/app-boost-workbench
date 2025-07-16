import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import AdSenseUnit from '@/components/ads/AdSenseUnit';
import { useAdTracking } from '@/hooks/useAdTracking';

const NotFound = () => {
  const location = useLocation();
  const { trackImpression, trackClick } = useAdTracking();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top AdSense Unit */}
      <div className="container mx-auto px-4 py-4">
        <AdSenseUnit
          adSlot="7419258036"
          adFormat="auto"
          onImpression={() => trackImpression({ adSlot: '7419258036', placementId: '404-top' })}
          onAdClick={() => trackClick({ adSlot: '7419258036', placementId: '404-top' })}
        />
      </div>

      <div className="flex items-center justify-center py-8">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-6">Oops! Page not found</p>
          
          <div className="mb-6">
            <AdSenseUnit
              adSlot="5812743096"
              adFormat="auto"
              className="max-w-sm mx-auto"
              onImpression={() => trackImpression({ adSlot: '5812743096', placementId: '404-middle' })}
              onAdClick={() => trackClick({ adSlot: '5812743096', placementId: '404-middle' })}
            />
          </div>
          
          <a href="/" className="text-blue-500 hover:text-blue-700 underline font-medium">
            Return to Home
          </a>
          
          <div className="mt-8">
            <p className="text-gray-500 text-sm mb-4">
              While you're here, check out these opportunities:
            </p>
            <div className="space-y-2 text-sm">
              <p>• Earn commissions through verified partners</p>
              <p>• Complete optimization tasks for rewards</p>
              <p>• Secure Bitcoin payments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom AdSense Unit */}
      <div className="container mx-auto px-4 pb-8">
        <AdSenseUnit
          adSlot="9630741852"
          adFormat="auto"
          onImpression={() => trackImpression({ adSlot: '9630741852', placementId: '404-bottom' })}
          onAdClick={() => trackClick({ adSlot: '9630741852', placementId: '404-bottom' })}
        />
      </div>
    </div>
  );
};

export default NotFound;
