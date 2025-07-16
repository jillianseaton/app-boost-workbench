import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star } from 'lucide-react';

const IndexSubscriptionTiers = () => {
  const tiers = [
    {
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
      popular: false,
      buttonText: 'Get Started',
      buttonVariant: 'outline' as const
    },
    {
      name: 'Standard',
      price: '$19.99',
      period: '/month',
      description: 'Great for serious commission earners',
      features: [
        'Up to 25 commission-earning tasks per month',
        'Advanced earnings analytics',
        'Priority email support',
        'Access to premium affiliate partners',
        'Partner API access',
        'Custom commission reporting'
      ],
      popular: true,
      buttonText: 'Most Popular',
      buttonVariant: 'default' as const
    },
    {
      name: 'Professional',
      price: '$29.99',
      period: '/month',
      description: 'Ideal for professional commission earners and teams',
      features: [
        'Up to 100 commission-earning tasks per month',
        'Real-time earnings monitoring',
        'Live chat support',
        'Advanced commission optimization',
        'White-label partner solutions',
        'Custom affiliate integrations',
        'Dedicated account manager'
      ],
      popular: false,
      buttonText: 'Go Pro',
      buttonVariant: 'outline' as const
    },
    {
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
      popular: false,
      buttonText: 'Contact Sales',
      buttonVariant: 'outline' as const
    }
  ];

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Subscribe to EarnFlow & Start Earning Commissions
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose your EarnFlow subscription tier to unlock commission-earning opportunities from our verified partners. 
            All plans include access to real affiliate partnerships and automated commission tracking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier, index) => (
            <Card 
              key={tier.name} 
              className={`relative h-full ${
                tier.popular 
                  ? 'border-primary shadow-lg ring-2 ring-primary/20' 
                  : 'border-border hover:border-primary/50'
              } transition-all duration-200 hover:shadow-md`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3 py-1 flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl font-semibold text-foreground">
                  {tier.name}
                </CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-foreground">
                    {tier.price}
                  </span>
                  <span className="text-muted-foreground">
                    {tier.period}
                  </span>
                </div>
                <CardDescription className="text-sm text-muted-foreground mt-2">
                  {tier.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0 flex flex-col h-full">
                <ul className="space-y-3 flex-1">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6">
                  <Button 
                    variant={tier.buttonVariant}
                    className="w-full"
                    size="lg"
                  >
                    {tier.buttonText}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            All plans include a 14-day free trial. Start earning commissions immediately. No credit card required.
          </p>
        </div>
      </div>
    </section>
  );
};

export default IndexSubscriptionTiers;