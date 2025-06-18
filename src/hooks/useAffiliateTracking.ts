
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PartnerService } from '@/types/partnerService';

export const useAffiliateTracking = () => {
  const { toast } = useToast();

  const handlePurchase = async (service: PartnerService) => {
    console.log('Processing affiliate purchase for:', service.name);
    
    try {
      // Enhanced affiliate tracking with CJ Affiliate support
      const trackingData = {
        serviceId: service.id,
        serviceName: service.name,
        partnerType: service.partnerType,
        price: service.price,
        commissionRate: service.commissionRate,
        billingPeriod: service.billingPeriod,
        category: service.category,
        userAgent: navigator.userAgent,
        referrer: document.referrer || 'direct',
        timestamp: new Date().toISOString(),
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        affiliateUrl: service.affiliateUrl,
        cjAffiliateId: service.cjAffiliateId,
        epc: service.epc,
        affiliateNetwork: service.cjAffiliateId ? 'commission_junction' : 'direct'
      };

      const { data: clickData, error: clickError } = await supabase.functions.invoke('affiliate-tracking', {
        body: {
          affiliateId: 'YOUR_AFFILIATE_ID',
          action: 'track_click',
          data: trackingData
        }
      });

      if (clickError) {
        console.error('Error tracking affiliate click:', clickError);
      } else {
        console.log('Affiliate click tracked successfully:', clickData);
      }

      // Open real affiliate link with proper tracking
      const affiliateUrlWithTracking = new URL(service.affiliateUrl);
      
      // Add CJ Affiliate specific tracking if applicable
      if (service.cjAffiliateId) {
        affiliateUrlWithTracking.searchParams.append('sid', 'marketplace_referral');
      } else {
        // For direct affiliate programs
        affiliateUrlWithTracking.searchParams.append('ref', 'YOUR_AFFILIATE_ID');
        affiliateUrlWithTracking.searchParams.append('utm_source', 'affiliate');
        affiliateUrlWithTracking.searchParams.append('utm_medium', 'partner_marketplace');
        affiliateUrlWithTracking.searchParams.append('utm_campaign', service.id);
      }

      window.open(affiliateUrlWithTracking.toString(), '_blank', 'noopener,noreferrer');

      // Show enhanced success toast
      toast({
        title: `Redirecting to ${service.name}`,
        description: `Opening ${service.partnerType} service. Complete your ${service.billingPeriod === 'one-time' ? 'purchase' : 'subscription'} to support our platform!`,
      });

    } catch (error) {
      console.error('Error processing affiliate purchase:', error);
      
      // Fallback: still redirect even if tracking fails
      window.open(service.affiliateUrl, '_blank', 'noopener,noreferrer');
      
      toast({
        title: "Redirecting...",
        description: `Opening ${service.name} purchase page`,
      });
    }
  };

  return { handlePurchase };
};
