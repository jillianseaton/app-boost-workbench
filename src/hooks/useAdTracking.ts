
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdTrackingData {
  adSlot: string;
  placementId: string;
  adType?: string;
}

export const useAdTracking = () => {
  const [isTracking, setIsTracking] = useState(false);

  const trackImpression = async (data: AdTrackingData) => {
    try {
      setIsTracking(true);
      
      const { data: result, error } = await supabase.functions.invoke('ad-revenue', {
        body: {
          action: 'track_impression',
          data: {
            adId: `ad_${data.adSlot}`,
            placementId: data.placementId,
            userId: 'anonymous',
            viewDuration: 0,
            visible: true,
            deviceType: window.innerWidth > 768 ? 'desktop' : 'mobile'
          }
        }
      });

      if (error) {
        console.error('Error tracking impression:', error);
        return null;
      }

      console.log('Ad impression tracked:', result);
      return result;
    } catch (error) {
      console.error('Error tracking impression:', error);
      return null;
    } finally {
      setIsTracking(false);
    }
  };

  const trackClick = async (data: AdTrackingData) => {
    try {
      setIsTracking(true);
      
      const { data: result, error } = await supabase.functions.invoke('ad-revenue', {
        body: {
          action: 'track_click',
          data: {
            adId: `ad_${data.adSlot}`,
            placementId: data.placementId,
            userId: 'anonymous',
            cpc: 0.35, // Average CPC for your niche
            adType: data.adType || 'display',
            targetUrl: window.location.href
          }
        }
      });

      if (error) {
        console.error('Error tracking click:', error);
        return null;
      }

      console.log('Ad click tracked:', result);
      return result;
    } catch (error) {
      console.error('Error tracking click:', error);
      return null;
    } finally {
      setIsTracking(false);
    }
  };

  return {
    trackImpression,
    trackClick,
    isTracking
  };
};
