
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
}

const PartnerServices: React.FC = () => {
  const { toast } = useToast();

  const partnerServices: PartnerService[] = [
    {
      id: "streammax-pro",
      name: "StreamMax Pro",
      product: "Premium Streaming Service",
      price: 29.99,
      originalPrice: 39.99,
      affiliateUrl: "https://streammax.com/signup?ref=AFFILIATE123",
      commissionRate: 0.15,
      category: "Entertainment",
      description: "Premium streaming with 4K content, exclusive shows, and ad-free experience",
      features: ["4K Ultra HD streaming", "Exclusive original content", "Ad-free experience", "Download for offline viewing"],
      rating: 4.8,
      billingPeriod: 'monthly',
      popularBadge: true
    },
    {
      id: "fittracker-elite",
      name: "FitTracker Elite",
      product: "Advanced Fitness Tracker",
      price: 199.99,
      originalPrice: 249.99,
      affiliateUrl: "https://fittracker.com/buy?ref=AFFILIATE123",
      commissionRate: 0.08,
      category: "Health & Fitness",
      description: "Advanced fitness tracking with heart rate monitoring, GPS, and sleep analysis",
      features: ["Heart rate monitoring", "Built-in GPS", "Sleep tracking", "7-day battery life"],
      rating: 4.6,
      billingPeriod: 'one-time'
    },
    {
      id: "cloudsync-business",
      name: "CloudSync Business",
      product: "Enterprise Cloud Storage",
      price: 49.99,
      affiliateUrl: "https://cloudsync.com/business?ref=AFFILIATE123",
      commissionRate: 0.20,
      category: "Business Tools",
      description: "Secure cloud storage for businesses with team collaboration and advanced security",
      features: ["1TB storage per user", "Advanced security", "Team collaboration", "24/7 support"],
      rating: 4.7,
      billingPeriod: 'monthly'
    },
    {
      id: "gamevault-premium",
      name: "GameVault Premium",
      product: "Gaming Subscription",
      price: 19.99,
      affiliateUrl: "https://gamevault.com/premium?ref=AFFILIATE123",
      commissionRate: 0.12,
      category: "Gaming",
      description: "Access to premium games library with exclusive titles and early releases",
      features: ["100+ premium games", "Early access releases", "Exclusive content", "No ads"],
      rating: 4.5,
      billingPeriod: 'monthly',
      popularBadge: true
    },
    {
      id: "designsuite-pro",
      name: "DesignSuite Pro",
      product: "Creative Design Tools",
      price: 89.99,
      originalPrice: 119.99,
      affiliateUrl: "https://designsuite.com/pro?ref=AFFILIATE123",
      commissionRate: 0.25,
      category: "Design",
      description: "Professional design tools for graphics, video editing, and creative projects",
      features: ["Advanced design tools", "Video editing", "Cloud storage", "Template library"],
      rating: 4.9,
      billingPeriod: 'monthly'
    },
    {
      id: "learnhub-academy",
      name: "LearnHub Academy",
      product: "Online Course Platform",
      price: 39.99,
      affiliateUrl: "https://learnhub.com/academy?ref=AFFILIATE123",
      commissionRate: 0.18,
      category: "Education",
      description: "Access to thousands of courses across technology, business, and creative fields",
      features: ["10,000+ courses", "Expert instructors", "Certificates", "Mobile learning"],
      rating: 4.4,
      billingPeriod: 'monthly'
    }
  ];

  const handlePurchase = async (service: PartnerService) => {
    console.log('Processing purchase for:', service.name);
    
    try {
      // Track the click with affiliate tracking system
      const { data: clickData, error: clickError } = await supabase.functions.invoke('affiliate-tracking', {
        body: {
          affiliateId: 'YOUR_AFFILIATE_ID',
          action: 'track_click',
          data: {
            serviceId: service.id,
            serviceName: service.name,
            price: service.price,
            commissionRate: service.commissionRate,
            userAgent: navigator.userAgent,
            referrer: document.referrer || 'direct',
            timestamp: new Date().toISOString()
          }
        }
      });

      if (clickError) {
        console.error('Error tracking click:', clickError);
      } else {
        console.log('Purchase click tracked successfully:', clickData);
      }

      // Open affiliate link in new tab
      window.open(service.affiliateUrl, '_blank', 'noopener,noreferrer');

      // Show success toast
      toast({
        title: "Redirecting to " + service.name,
        description: `You'll be redirected to complete your ${service.billingPeriod === 'one-time' ? 'purchase' : 'subscription'}. Your support helps keep our platform free!`,
      });

    } catch (error) {
      console.error('Error processing purchase:', error);
      
      // Still redirect even if tracking fails
      window.open(service.affiliateUrl, '_blank', 'noopener,noreferrer');
      
      toast({
        title: "Redirecting...",
        description: "Opening " + service.name + " purchase page",
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Recommended Partner Services
          <span className="text-sm font-normal text-muted-foreground ml-2">
            (Affiliate partnerships help support our platform)
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
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {service.category}
                </span>
              </div>
              
              <p className="text-sm text-gray-700 font-medium mb-2">{service.product}</p>
              <p className="text-xs text-gray-600 mb-4 line-clamp-2">{service.description}</p>
              
              {/* Rating */}
              <div className="flex items-center gap-1 mb-3">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{service.rating}</span>
                <span className="text-xs text-gray-500">(1,200+ reviews)</span>
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
            How Our Affiliate Marketplace Works
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h6 className="font-semibold text-blue-800 mb-2">For You:</h6>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Discover premium services at great prices</li>
                <li>• Read honest reviews and comparisons</li>
                <li>• Get exclusive deals through our partnerships</li>
                <li>• Support our platform at no extra cost</li>
              </ul>
            </div>
            <div>
              <h6 className="font-semibold text-blue-800 mb-2">How We Earn:</h6>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Commission from partner services (8-25%)</li>
                <li>• No additional cost to you</li>
                <li>• Helps keep our platform free</li>
                <li>• Transparent earning disclosure</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PartnerServices;
