
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
  },
  
  // Pay-Per-Click Affiliate Programs
  {
    id: "google-ads-cpc",
    name: "Google Ads",
    product: "Pay-Per-Click Advertising",
    price: 0.50, // Per click payout
    affiliateUrl: "https://ads.google.com/start",
    commissionRate: 1.0, // 100% of click value
    category: "Advertising",
    description: "Earn $0.50 per click for Google Ads referrals - instant commission on every click!",
    features: ["Instant click payouts", "No minimum threshold", "Real-time tracking", "Global traffic"],
    rating: 4.6,
    billingPeriod: 'one-time',
    partnerType: 'financial',
    popularBadge: true,
    // Pay-per-click configuration
    affiliateNetwork: 'direct',
    trackingParams: {
      campaign: 'cpc_marketplace',
      source: 'affiliate_clicks'
    },
    conversionTracking: {
      enabled: true,
      postbackUrl: 'https://laoltiyaaagiiutahypb.supabase.co/functions/v1/partner-conversion-webhook',
      paymentType: 'cpc', // Cost per click
      instantPayout: true
    }
  },
  {
    id: "microsoft-ads-cpc",
    name: "Microsoft Advertising",
    product: "Bing Ads Platform",
    price: 0.35, // Per click payout
    affiliateUrl: "https://ads.microsoft.com",
    commissionRate: 1.0,
    category: "Advertising", 
    description: "Get paid $0.35 for every click to Microsoft Ads - immediate commission payment!",
    features: ["$0.35 per click", "Instant payouts", "Microsoft network", "High conversion rates"],
    rating: 4.4,
    billingPeriod: 'one-time',
    partnerType: 'financial',
    affiliateNetwork: 'direct',
    trackingParams: {
      ref: 'cpc_affiliate',
      campaign: 'marketplace_cpc'
    },
    conversionTracking: {
      enabled: true,
      postbackUrl: 'https://laoltiyaaagiiutahypb.supabase.co/functions/v1/partner-conversion-webhook',
      paymentType: 'cpc',
      instantPayout: true
    }
  },
  {
    id: "taboola-cpc",
    name: "Taboola",
    product: "Content Discovery Network",
    price: 0.25, // Per click payout
    affiliateUrl: "https://www.taboola.com/advertisers",
    commissionRate: 1.0,
    category: "Advertising",
    description: "Earn $0.25 per click from Taboola's content discovery platform - paid instantly!",
    features: ["$0.25 per click", "Native advertising", "Content discovery", "Instant commission"],
    rating: 4.3,
    billingPeriod: 'one-time',
    partnerType: 'financial',
    affiliateNetwork: 'direct',
    trackingParams: {
      source: 'affiliate_marketplace',
      medium: 'cpc_referral'
    },
    conversionTracking: {
      enabled: true,
      postbackUrl: 'https://laoltiyaaagiiutahypb.supabase.co/functions/v1/partner-conversion-webhook',
      paymentType: 'cpc',
      instantPayout: true
    }
  },
  {
    id: "outbrain-cpc",
    name: "Outbrain",
    product: "Native Advertising Platform",
    price: 0.40, // Per click payout
    affiliateUrl: "https://www.outbrain.com/amplify",
    commissionRate: 1.0,
    category: "Advertising",
    description: "Generate $0.40 per click with Outbrain's premium native advertising - instant payouts!",
    features: ["$0.40 per click", "Premium publishers", "Native ads", "Real-time payments"],
    rating: 4.5,
    billingPeriod: 'one-time',
    partnerType: 'financial',
    affiliateNetwork: 'direct',
    trackingParams: {
      source: 'marketplace_affiliate',
      campaign: 'cpc_program'
    },
    conversionTracking: {
      enabled: true,
      postbackUrl: 'https://laoltiyaaagiiutahypb.supabase.co/functions/v1/partner-conversion-webhook',
      paymentType: 'cpc',
      instantPayout: true
    }
  }
];
