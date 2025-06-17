
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, ExternalLink, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PartnerService {
  id: string;
  name: string;
  product: string;
  price: number;
  affiliateUrl: string;
  commissionRate: number;
  category: string;
  description: string;
}

const PartnerServices: React.FC = () => {
  const { toast } = useToast();

  const partnerServices: PartnerService[] = [
    {
      id: "streammax-pro",
      name: "StreamMax Pro",
      product: "Premium Streaming Service",
      price: 29.99,
      affiliateUrl: "https://streammax.com/signup?ref=AFFILIATE123",
      commissionRate: 0.15,
      category: "Entertainment",
      description: "Premium streaming with 4K content, exclusive shows, and ad-free experience"
    },
    {
      id: "fittracker-elite",
      name: "FitTracker Elite",
      product: "Advanced Fitness Tracker",
      price: 199.99,
      affiliateUrl: "https://fittracker.com/buy?ref=AFFILIATE123",
      commissionRate: 0.08,
      category: "Health & Fitness",
      description: "Advanced fitness tracking with heart rate monitoring, GPS, and sleep analysis"
    },
    {
      id: "cloudsync-business",
      name: "CloudSync Business",
      product: "Enterprise Cloud Storage",
      price: 49.99,
      affiliateUrl: "https://cloudsync.com/business?ref=AFFILIATE123",
      commissionRate: 0.20,
      category: "Business Tools",
      description: "Secure cloud storage for businesses with team collaboration and advanced security"
    },
    {
      id: "gamevault-premium",
      name: "GameVault Premium",
      product: "Gaming Subscription",
      price: 19.99,
      affiliateUrl: "https://gamevault.com/premium?ref=AFFILIATE123",
      commissionRate: 0.12,
      category: "Gaming",
      description: "Access to premium games library with exclusive titles and early releases"
    },
    {
      id: "designsuite-pro",
      name: "DesignSuite Pro",
      product: "Creative Design Tools",
      price: 89.99,
      affiliateUrl: "https://designsuite.com/pro?ref=AFFILIATE123",
      commissionRate: 0.25,
      category: "Design",
      description: "Professional design tools for graphics, video editing, and creative projects"
    },
    {
      id: "learnhub-academy",
      name: "LearnHub Academy",
      product: "Online Course Platform",
      price: 39.99,
      affiliateUrl: "https://learnhub.com/academy?ref=AFFILIATE123",
      commissionRate: 0.18,
      category: "Education",
      description: "Access to thousands of courses across technology, business, and creative fields"
    }
  ];

  const handleAffiliateClick = async (service: PartnerService) => {
    console.log('Tracking affiliate click for:', service.name);
    
    try {
      // Track the click with affiliate tracking system
      const { data: clickData, error: clickError } = await supabase.functions.invoke('affiliate-tracking', {
        body: {
          affiliateId: 'YOUR_AFFILIATE_ID', // This would be your unique affiliate ID
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
        console.log('Click tracked successfully:', clickData);
      }

      // Open affiliate link in new tab
      window.open(service.affiliateUrl, '_blank', 'noopener,noreferrer');

      // Show success toast
      toast({
        title: "Redirecting to " + service.name,
        description: `Opening ${service.product} in a new tab. Complete your purchase to support our platform!`,
      });

    } catch (error) {
      console.error('Error handling affiliate click:', error);
      
      // Still redirect even if tracking fails
      window.open(service.affiliateUrl, '_blank', 'noopener,noreferrer');
      
      toast({
        title: "Redirecting...",
        description: "Opening " + service.name + " in a new tab",
      });
    }
  };

  const calculateCommission = (price: number, rate: number) => {
    return (price * rate).toFixed(2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Our Partner Services
          <span className="text-sm font-normal text-muted-foreground ml-2">
            (Earn affiliate revenue when users purchase)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {partnerServices.map((service) => (
            <div key={service.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold">{service.name}</h4>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {service.category}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground mb-2">{service.product}</p>
              <p className="text-xs text-gray-600 mb-3 line-clamp-2">{service.description}</p>
              
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-bold text-green-600">${service.price}</p>
                <div className="flex items-center gap-1 text-xs text-orange-600">
                  <TrendingUp className="h-3 w-3" />
                  ${calculateCommission(service.price, service.commissionRate)} commission
                </div>
              </div>
              
              <Button 
                onClick={() => handleAffiliateClick(service)}
                className="w-full"
                size="sm"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Get {service.name}
              </Button>
              
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {(service.commissionRate * 100).toFixed(0)}% affiliate commission
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h5 className="font-semibold text-blue-900 mb-2">How Affiliate Revenue Works</h5>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Users click on partner service links above</li>
            <li>• Each click is tracked with our affiliate system</li>
            <li>• When users complete purchases, you earn commission</li>
            <li>• Commission rates range from 8% to 25% depending on the service</li>
            <li>• View your earnings in the affiliate dashboard</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default PartnerServices;
