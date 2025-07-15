
import { PartnerService } from '@/types/partnerService';

export const partnerServices: PartnerService[] = [
  // Keep existing high-performing services
  {
    id: "max-streaming",
    name: "Max (HBO Max)",
    product: "Premium Streaming Service",
    price: 15.99,
    originalPrice: 19.99,
    affiliateUrl: "https://www.max.com/bg/en/affiliate",
    commissionRate: 0.08,
    category: "Entertainment",
    description: "Premium streaming with HBO originals, blockbuster movies, and exclusive content",
    features: ["HBO Original Series", "Same-day movie releases", "4K streaming", "Ad-free experience"],
    rating: 4.7,
    billingPeriod: 'monthly',
    popularBadge: true,
    partnerType: 'streaming'
  },
  {
    id: "shopify-partners",
    name: "Shopify",
    product: "E-commerce Platform",
    price: 29.00,
    affiliateUrl: "https://www.shopify.com/partners",
    commissionRate: 0.20,
    category: "E-commerce",
    description: "Complete e-commerce solution for building and scaling online stores",
    features: ["Professional themes", "Payment processing", "Inventory management", "Mobile optimization"],
    rating: 4.8,
    billingPeriod: 'monthly',
    partnerType: 'software'
  },
  {
    id: "bluehost-affiliate",
    name: "Bluehost",
    product: "Web Hosting Service",
    price: 3.95,
    originalPrice: 9.99,
    affiliateUrl: "https://www.bluehost.com/track/your-affiliate-id",
    commissionRate: 0.15,
    category: "Web Hosting",
    description: "Reliable web hosting with WordPress optimization and 24/7 support",
    features: ["WordPress hosting", "Free domain", "SSL certificate", "24/7 support"],
    rating: 4.5,
    billingPeriod: 'monthly',
    partnerType: 'hosting'
  },
  {
    id: "canva-pro-affiliate",
    name: "Canva Pro",
    product: "Design Platform",
    price: 14.99,
    originalPrice: 19.99,
    affiliateUrl: "https://www.canva.com/affiliates",
    commissionRate: 0.10,
    category: "Design",
    description: "Professional design tools with premium templates and brand management",
    features: ["Premium templates", "Brand kit", "Background remover", "Team collaboration"],
    rating: 4.9,
    billingPeriod: 'monthly',
    partnerType: 'design'
  }
];
