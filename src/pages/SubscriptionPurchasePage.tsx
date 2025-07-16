import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check, CreditCard, Shield, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import AdSenseUnit from '@/components/ads/AdSenseUnit';
import { useAdTracking } from '@/hooks/useAdTracking';

const SubscriptionPurchasePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { trackImpression, trackClick } = useAdTracking();
  const [loading, setLoading] = useState(false);
  
  const tier = searchParams.get('tier') || 'basic';

  const tierDetails = {
    basic: {
      name: 'Basic',
      price: '$9.99',
      period: '/month',
      description: 'Perfect for individuals starting to earn commissions',
      features: [
        'Up to 5 commission-earning tasks per day',
        'Basic earnings analytics',
        'Email support',
        'Access to standard affiliate partners',
        'Mobile app access'
      ],
      popular: false
    },
    standard: {
      name: 'Standard',
      price: '$19.99',
      period: '/month',
      description: 'Great for serious commission earners',
      features: [
        'Up to 25 commission-earning tasks per day',
        'Advanced earnings analytics',
        'Priority email support',
        'Access to premium affiliate partners',
        'Partner API access',
        'Custom commission reporting'
      ],
      popular: true
    },
    professional: {
      name: 'Professional',
      price: '$29.99',
      period: '/month',
      description: 'Ideal for professional commission earners and teams',
      features: [
        'Up to 100 commission-earning tasks per day',
        'Real-time earnings monitoring',
        'Live chat support',
        'Advanced commission optimization',
        'White-label partner solutions',
        'Custom affiliate integrations',
        'Dedicated account manager'
      ],
      popular: false
    },
    enterprise: {
      name: 'Enterprise',
      price: '$49.99',
      period: '/month',
      description: 'For large organizations maximizing commission revenue',
      features: [
        'Unlimited commission-earning tasks',
        'Enterprise-grade earnings analytics',
        '24/7 phone support',
        'Custom commission strategies',
        'Dedicated infrastructure',
        'Revenue SLA guarantees',
        'Multi-team commission tracking',
        'Advanced revenue security'
      ],
      popular: false
    }
  };

  const selectedTier = tierDetails[tier as keyof typeof tierDetails] || tierDetails.basic;

  const handlePurchase = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe to EarnFlow.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-subscription-checkout', {
        body: { tier }
      });

      if (error) {
        throw new Error(error.message || 'Failed to create checkout session');
      }

      if (data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Subscription purchase error:', error);
      toast({
        title: "Purchase Failed",
        description: error instanceof Error ? error.message : "Failed to start checkout process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      {/* Top AdSense Unit */}
      <div className="container mx-auto max-w-4xl mb-6">
        <AdSenseUnit
          adSlot="4567891230"
          adFormat="auto"
          onImpression={() => trackImpression({ adSlot: '4567891230', placementId: 'subscription-top' })}
          onAdClick={() => trackClick({ adSlot: '4567891230', placementId: 'subscription-top' })}
        />
      </div>

      <div className="container mx-auto max-w-4xl space-y-6">
        <div className="flex items-center gap-4">
          <Button onClick={() => navigate('/')} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold text-primary">Subscribe to EarnFlow</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Selected Plan Details */}
          <Card className={`relative ${selectedTier.popular ? 'border-primary shadow-lg ring-2 ring-primary/20' : ''}`}>
            {selectedTier.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-3 py-1 flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Most Popular
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-semibold text-foreground">
                {selectedTier.name} Plan
              </CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold text-foreground">
                  {selectedTier.price}
                </span>
                <span className="text-muted-foreground text-lg">
                  {selectedTier.period}
                </span>
              </div>
              <p className="text-muted-foreground mt-2">
                {selectedTier.description}
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">What's included:</h3>
                <ul className="space-y-3">
                  {selectedTier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <Button 
                  onClick={handlePurchase}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Subscribe Now
                    </div>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Shield className="h-3 w-3" />
                  Secure payment powered by Stripe
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Purchase Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Benefits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Real Commission Earnings</h4>
                    <p className="text-sm text-muted-foreground">
                      Earn actual commissions from verified affiliate partners and optimization tasks.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Automated Payments</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive secure payments via Bitcoin, bank transfer, or other supported methods.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Performance Analytics</h4>
                    <p className="text-sm text-muted-foreground">
                      Track your earnings, optimization performance, and revenue growth over time.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Partner Network Access</h4>
                    <p className="text-sm text-muted-foreground">
                      Connect with Fortune 500 companies and established affiliate programs.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Middle AdSense Unit */}
            <AdSenseUnit
              adSlot="9876543210"
              adFormat="fluid"
              onImpression={() => trackImpression({ adSlot: '9876543210', placementId: 'subscription-middle' })}
              onAdClick={() => trackClick({ adSlot: '9876543210', placementId: 'subscription-middle' })}
            />

            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1">Can I cancel anytime?</h4>
                  <p className="text-sm text-muted-foreground">
                    Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">How do I receive payments?</h4>
                  <p className="text-sm text-muted-foreground">
                    Earnings are automatically processed through your connected payment methods, including Bitcoin wallets and bank accounts.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Is there a free trial?</h4>
                  <p className="text-sm text-muted-foreground">
                    We offer a 14-day free trial for all new subscribers. No credit card required to start.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom AdSense Unit */}
        <div className="mt-8">
          <AdSenseUnit
            adSlot="1357924680"
            adFormat="auto"
            onImpression={() => trackImpression({ adSlot: '1357924680', placementId: 'subscription-bottom' })}
            onAdClick={() => trackClick({ adSlot: '1357924680', placementId: 'subscription-bottom' })}
          />
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPurchasePage;