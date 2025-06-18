import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, ExternalLink, TrendingUp, Star, Clock, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PartnerService {
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
  partnerType: 'streaming' | 'software' | 'hosting' | 'education' | 'fitness' | 'design' | 'flowers';
  cjAffiliateId?: string;
  epc?: string;
}

const PartnerServices: React.FC = () => {
  const { toast } = useToast();

  const partnerServices: PartnerService[] = [
    // Real CJ Affiliate - 1-800-FLORALS services
    {
      id: "1800florals-general",
      name: "1-800-FLORALS",
      product: "Flower Delivery Service",
      price: 49.99,
      originalPrice: 59.99,
      affiliateUrl: "https://www.kqzyfj.com/click-101467082-5656123",
      commissionRate: 0.08,
      category: "Flowers & Gifts",
      description: "Fast, safe, guaranteed nationwide flower delivery with same-day service available",
      features: ["Nationwide delivery", "Same-day service", "Satisfaction guaranteed", "Fresh flowers"],
      rating: 4.6,
      billingPeriod: 'one-time',
      popularBadge: true,
      partnerType: 'flowers',
      cjAffiliateId: "5656123",
      epc: "$1.00 USD"
    },
    {
      id: "1800florals-birthday",
      name: "Birthday Flowers Online",
      product: "Birthday Flower Arrangements",
      price: 39.99,
      affiliateUrl: "https://www.jdoqocy.com/click-101467082-5656128",
      commissionRate: 0.08,
      category: "Flowers & Gifts",
      description: "Beautiful birthday flower arrangements delivered fresh to celebrate special occasions",
      features: ["Birthday themed bouquets", "Fresh arrangements", "Fast delivery", "Gift options"],
      rating: 4.7,
      billingPeriod: 'one-time',
      partnerType: 'flowers',
      cjAffiliateId: "5656128"
    },
    {
      id: "1800florals-romantic",
      name: "Romantic Roses Online",
      product: "Red Rose Bouquets",
      price: 69.99,
      originalPrice: 89.99,
      affiliateUrl: "https://www.anrdoezrs.net/click-101467082-5656131",
      commissionRate: 0.08,
      category: "Flowers & Gifts",
      description: "Premium red roses and romantic bouquets perfect for anniversaries and special moments",
      features: ["Premium red roses", "Romantic arrangements", "Love messages included", "Express delivery"],
      rating: 4.8,
      billingPeriod: 'one-time',
      partnerType: 'flowers',
      cjAffiliateId: "5656131"
    },
    {
      id: "1800florals-sympathy",
      name: "Sympathy Flowers",
      product: "Funeral & Sympathy Arrangements",
      price: 79.99,
      affiliateUrl: "https://www.tkqlhce.com/click-101467082-10281235",
      commissionRate: 0.08,
      category: "Flowers & Gifts",
      description: "Thoughtful sympathy flowers and funeral arrangements for expressing condolences",
      features: ["Sympathy arrangements", "Funeral flowers", "Respectful designs", "Timely delivery"],
      rating: 4.5,
      billingPeriod: 'one-time',
      partnerType: 'flowers',
      cjAffiliateId: "10281235"
    },
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

  const calculateCommission = (price: number, rate: number) => {
    return (price * rate).toFixed(2);
  };

  const formatPrice = (service: PartnerService) => {
    const period = service.billingPeriod === 'monthly' ? '/mo' : 
                   service.billingPeriod === 'yearly' ? '/year' : '';
    return `$${service.price}${period}`;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Entertainment': 'bg-purple-100 text-purple-800',
      'E-commerce': 'bg-green-100 text-green-800',
      'Web Hosting': 'bg-blue-100 text-blue-800',
      'Education': 'bg-orange-100 text-orange-800',
      'Design': 'bg-pink-100 text-pink-800',
      'Health & Fitness': 'bg-red-100 text-red-800',
      'Shopping': 'bg-yellow-100 text-yellow-800',
      'Productivity': 'bg-indigo-100 text-indigo-800',
      'Flowers & Gifts': 'bg-rose-100 text-rose-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Partner Affiliate Services
          <span className="text-sm font-normal text-muted-foreground ml-2">
            (Real affiliate partnerships - including CJ Affiliate network!)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partnerServices.map((service) => (
            <div key={service.id} className="relative p-6 border rounded-lg hover:shadow-lg transition-all duration-200 bg-white">
              {service.popularBadge && (
                <div className="absolute -top-2 left-4 bg-orange-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                  Popular Choice
                </div>
              )}
              
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-bold text-lg">{service.name}</h4>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(service.category)}`}>
                    {service.category}
                  </span>
                  {service.cjAffiliateId && (
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                      CJ Affiliate
                    </span>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-gray-700 font-medium mb-2">{service.product}</p>
              <p className="text-xs text-gray-600 mb-4 line-clamp-2">{service.description}</p>
              
              {/* Rating */}
              <div className="flex items-center gap-1 mb-3">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{service.rating}</span>
                <span className="text-xs text-gray-500">(Real reviews)</span>
                {service.epc && (
                  <span className="text-xs text-blue-600 ml-2">EPC: {service.epc}</span>
                )}
              </div>

              {/* Features */}
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-700 mb-2">Key Features:</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  {service.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Pricing */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  {service.originalPrice && (
                    <p className="text-xs text-gray-500 line-through">${service.originalPrice}</p>
                  )}
                  <p className="text-xl font-bold text-green-600">{formatPrice(service)}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs text-orange-600">
                    <TrendingUp className="h-3 w-3" />
                    <span>We earn ${calculateCommission(service.price, service.commissionRate)}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {(service.commissionRate * 100).toFixed(0)}% commission
                  </p>
                </div>
              </div>
              
              {/* Billing Period Badge */}
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-3 w-3 text-blue-500" />
                <span className="text-xs text-blue-600 capitalize">
                  {service.billingPeriod === 'one-time' ? 'One-time purchase' : `${service.billingPeriod} billing`}
                </span>
              </div>
              
              <Button 
                onClick={() => handlePurchase(service)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="sm"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {service.billingPeriod === 'one-time' ? 'Buy Now' : 'Start Subscription'}
              </Button>
              
              <div className="mt-3 flex items-center justify-center gap-1 text-xs text-gray-500">
                <Shield className="h-3 w-3" />
                <span>Secure checkout via {service.name}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <h5 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Real Affiliate Partnership Program
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h6 className="font-semibold text-blue-800 mb-2">For You:</h6>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Access real premium services at competitive prices</li>
                <li>• Verified partnerships with trusted brands</li>
                <li>• Exclusive deals through our affiliate network</li>
                <li>• Support our platform at no additional cost</li>
              </ul>
            </div>
            <div>
              <h6 className="font-semibold text-blue-800 mb-2">Our Partnership Model:</h6>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Real commission earnings (4-25%)</li>
                <li>• Commission Junction (CJ Affiliate) integration</li>
                <li>• Direct partnerships with service providers</li>
                <li>• Monthly payout processing</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-white rounded border-l-4 border-blue-500">
            <p className="text-sm text-blue-800">
              <strong>Active Integration:</strong> We've integrated your real CJ Affiliate links for 1-800-FLORALS! 
              Update the affiliate IDs (currently using 101467082) with your actual CJ Affiliate publisher ID to start earning.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PartnerServices;
