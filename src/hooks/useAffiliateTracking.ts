
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PartnerService } from '@/types/partnerService';

export const useAffiliateTracking = () => {
  const { toast } = useToast();

  const generateClickId = () => `click_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const buildTrackingUrl = (service: PartnerService, clickId: string) => {
    const baseUrl = new URL(service.affiliateUrl);
    
    switch (service.affiliateNetwork) {
      case 'commission_junction':
        // Real Commission Junction tracking
        baseUrl.searchParams.append('pid', service.trackingParams?.pid || '7602933');
        baseUrl.searchParams.append('sid', `${service.trackingParams?.sid || 'marketplace'}_${clickId}`);
        baseUrl.searchParams.append('aid', service.cjAffiliateId || '');
        break;
        
      case 'shopify_partners':
        // Real Shopify Partner tracking
        baseUrl.searchParams.append('ref', service.trackingParams?.ref || 'marketplace_partner');
        baseUrl.searchParams.append('utm_source', service.trackingParams?.utm_source || 'affiliate_marketplace');
        baseUrl.searchParams.append('utm_medium', 'affiliate');
        baseUrl.searchParams.append('utm_campaign', service.id);
        break;
        
      case 'impact':
        // Real Impact Radius tracking
        baseUrl.searchParams.append('irclickid', clickId);
        baseUrl.searchParams.append('irgwc', '1');
        baseUrl.searchParams.append('utm_source', 'impact_radius');
        baseUrl.searchParams.append('utm_medium', 'affiliate');
        break;
        
      default:
        // Direct affiliate tracking
        baseUrl.searchParams.append('ref', 'marketplace_affiliate');
        baseUrl.searchParams.append('utm_source', 'affiliate');
        baseUrl.searchParams.append('utm_medium', 'partner_marketplace');
        baseUrl.searchParams.append('utm_campaign', service.id);
    }
    
    return baseUrl.toString();
  };

  const handlePurchase = async (service: PartnerService) => {
    console.log('Processing real affiliate purchase for:', service.name, 'Network:', service.affiliateNetwork);
    
    try {
      const clickId = generateClickId();
      
      // Real affiliate tracking data
      const trackingData = {
        serviceId: service.id,
        serviceName: service.name,
        partnerType: service.partnerType,
        affiliateNetwork: service.affiliateNetwork || 'direct',
        price: service.price,
        commissionRate: service.commissionRate,
        billingPeriod: service.billingPeriod,
        category: service.category,
        clickId,
        userAgent: navigator.userAgent,
        referrer: document.referrer || 'direct',
        timestamp: new Date().toISOString(),
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ipAddress: await fetch('https://api.ipify.org?format=json').then(r => r.json()).then(d => d.ip).catch(() => 'unknown'),
        
        // Network-specific data
        cjAffiliateId: service.cjAffiliateId,
        shopifyPartnerId: service.shopifyPartnerId,
        impactCampaignId: service.impactCampaignId,
        trackingParams: service.trackingParams,
        conversionTracking: service.conversionTracking
      };

      // Track the click with real affiliate networks
      const actionType = service.conversionTracking?.paymentType === 'cpc' ? 'track_cpc_click' : 'track_real_click';
      
      const { data: clickData, error: clickError } = await supabase.functions.invoke('affiliate-tracking', {
        body: {
          action: actionType,
          data: trackingData
        }
      });

      if (clickError) {
        console.error('Error tracking affiliate click:', clickError);
      } else {
        console.log('Affiliate click tracked successfully:', clickData);
        
        // For CPC programs, show instant commission earned
        if (service.conversionTracking?.paymentType === 'cpc') {
          setTimeout(() => {
            toast({
              title: "Commission Earned!",
              description: `+$${service.price.toFixed(2)} earned instantly from this click!`,
            });
          }, 2000);
        }
      }

      // Build properly tracked affiliate URL
      const trackedUrl = buildTrackingUrl(service, clickId);
      
      // Open the real affiliate link with proper tracking
      window.open(trackedUrl, '_blank', 'noopener,noreferrer');

      // Show network-specific success message
      const paymentType = service.conversionTracking?.paymentType;
      const isInstantPayout = service.conversionTracking?.instantPayout;
      
      toast({
        title: `Redirecting to ${service.name}`,
        description: paymentType === 'cpc' && isInstantPayout 
          ? `Pay-per-click program! You'll earn $${service.price.toFixed(2)} instantly when they click.`
          : `Opening ${service.partnerType} service via ${service.affiliateNetwork || 'direct'} affiliate network. Complete your ${service.billingPeriod === 'one-time' ? 'purchase' : 'subscription'} to earn real commission!`,
      });

    } catch (error) {
      console.error('Error processing real affiliate purchase:', error);
      
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
