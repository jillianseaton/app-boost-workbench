
import React, { useEffect, useRef } from 'react';

interface AdSenseUnitProps {
  adSlot: string;
  adFormat?: string;
  adLayout?: string;
  style?: React.CSSProperties;
  className?: string;
  onImpression?: () => void;
  onAdClick?: () => void;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const AdSenseUnit: React.FC<AdSenseUnitProps> = ({
  adSlot,
  adFormat = "auto",
  adLayout,
  style = { display: 'block' },
  className = "",
  onImpression,
  onAdClick
}) => {
  const adRef = useRef<HTMLDivElement>(null);
  const hasRendered = useRef(false);

  useEffect(() => {
    if (!hasRendered.current && adRef.current) {
      try {
        // Initialize adsbygoogle if not already done
        window.adsbygoogle = window.adsbygoogle || [];
        
        // Push the ad configuration
        window.adsbygoogle.push({});
        
        // Track impression
        if (onImpression) {
          onImpression();
        }
        
        hasRendered.current = true;
      } catch (error) {
        console.error('AdSense error:', error);
      }
    }
  }, [onImpression]);

  const handleAdClick = () => {
    if (onAdClick) {
      onAdClick();
    }
  };

  // Special handling for different ad types
  const isFluidAd = adFormat === "fluid";
  const adLayoutKey = isFluidAd && !adLayout ? "-fb-x-2-bu+wu" : undefined;

  return (
    <div 
      ref={adRef}
      className={className}
      onClick={handleAdClick}
    >
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client="ca-pub-9370068622982104"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
        {...(adLayout && { 'data-ad-layout': adLayout })}
        {...(adLayoutKey && { 'data-ad-layout-key': adLayoutKey })}
      />
    </div>
  );
};

export default AdSenseUnit;
