
export interface PartnerService {
  id: string;
  name: string;
  product: string;
  price: number;
  originalPrice?: number;
  affiliateUrl: string;
  commissionRate: number;
  category: string;
  description: string;
  features: string[];
  rating: number;
  billingPeriod: 'monthly' | 'yearly' | 'one-time';
  popularBadge?: boolean;
  partnerType: 'streaming' | 'software' | 'hosting' | 'education' | 'fitness' | 'design' | 'flowers' | 'financial';
  cjAffiliateId?: string;
  epc?: string;
  
  // Real affiliate tracking properties
  affiliateNetwork?: 'commission_junction' | 'shopify_partners' | 'impact' | 'direct';
  shopifyPartnerId?: string;
  impactCampaignId?: string;
  trackingParams?: {
    [key: string]: string;
  };
  conversionTracking?: {
    enabled: boolean;
    postbackUrl?: string;
    webhookUrl?: string;
    impactTrackingUrl?: string;
    pixelId?: string;
    apiKey?: string;
    campaignId?: string;
  };
}
