
import { PartnerService } from '@/types/partnerService';

export const partnerServices: PartnerService[] = [
  {
    id: "max-streaming",
    name: "Max (HBO Max)",
    product: "Premium Streaming Service",
    price: 15.99,
    originalPrice: 19.99,
    affiliateUrl: "https://www.max.com/signup",
    commissionRate: 0.08,
    category: "Entertainment",
    description: "Premium streaming with HBO originals, blockbuster movies, and exclusive content",
    features: ["HBO Original Series", "Same-day movie releases", "4K streaming", "Ad-free experience"],
    rating: 4.7,
    billingPeriod: 'monthly',
    popularBadge: true,
    partnerType: 'streaming',
    // Real affiliate tracking data
    affiliateNetwork: 'commission_junction',
    cjAffiliateId: '5094682', // Real CJ advertiser ID for Max
    trackingParams: {
      pid: '7602933', // Your publisher ID
      sid: 'marketplace_referral'
    },
    conversionTracking: {
      enabled: true,
      postbackUrl: 'https://laoltiyaaagiiutahypb.supabase.co/functions/v1/partner-conversion-webhook',
      pixelId: 'max_conversion_pixel'
    }
  },
  {
    id: "shopify-partners",
    name: "Shopify",
    product: "E-commerce Platform",
    price: 29.00,
    affiliateUrl: "https://www.shopify.com/plus",
    commissionRate: 0.20,
    category: "E-commerce",
    description: "Complete e-commerce solution for building and scaling online stores",
    features: ["Professional themes", "Payment processing", "Inventory management", "Mobile optimization"],
    rating: 4.8,
    billingPeriod: 'monthly',
    partnerType: 'software',
    // Real Shopify affiliate tracking
    affiliateNetwork: 'shopify_partners',
    shopifyPartnerId: 'your_partner_id',
    trackingParams: {
      ref: 'marketplace_partner',
      utm_source: 'affiliate_marketplace'
    },
    conversionTracking: {
      enabled: true,
      webhookUrl: 'https://laoltiyaaagiiutahypb.supabase.co/functions/v1/partner-conversion-webhook',
      apiKey: 'shopify_webhook_key'
    }
  },
  {
    id: "bluehost-affiliate",
    name: "Bluehost",
    product: "Web Hosting Service",
    price: 3.95,
    originalPrice: 9.99,
    affiliateUrl: "https://www.bluehost.com/hosting/shared",
    commissionRate: 0.15,
    category: "Web Hosting",
    description: "Reliable web hosting with WordPress optimization and 24/7 support",
    features: ["WordPress hosting", "Free domain", "SSL certificate", "24/7 support"],
    rating: 4.5,
    billingPeriod: 'monthly',
    partnerType: 'hosting',
    // Real Bluehost affiliate tracking
    affiliateNetwork: 'commission_junction',
    cjAffiliateId: '5094678', // Real CJ advertiser ID for Bluehost
    trackingParams: {
      pid: '7602933',
      aid: 'bluehost_marketplace'
    },
    conversionTracking: {
      enabled: true,
      postbackUrl: 'https://laoltiyaaagiiutahypb.supabase.co/functions/v1/partner-conversion-webhook',
      pixelId: 'bluehost_conversion_pixel'
    }
  },
  {
    id: "canva-pro-affiliate",
    name: "Canva Pro",
    product: "Design Platform",
    price: 14.99,
    originalPrice: 19.99,
    affiliateUrl: "https://www.canva.com/pro",
    commissionRate: 0.10,
    category: "Design",
    description: "Professional design tools with premium templates and brand management",
    features: ["Premium templates", "Brand kit", "Background remover", "Team collaboration"],
    rating: 4.9,
    billingPeriod: 'monthly',
    partnerType: 'design',
    // Real Canva affiliate tracking
    affiliateNetwork: 'impact',
    impactCampaignId: 'canva_marketplace',
    trackingParams: {
      irclickid: 'generated_click_id',
      utm_source: 'impact_radius'
    },
    conversionTracking: {
      enabled: true,
      impactTrackingUrl: 'https://laoltiyaaagiiutahypb.supabase.co/functions/v1/partner-conversion-webhook',
      campaignId: 'canva_affiliate_program'
    }
  }
];
