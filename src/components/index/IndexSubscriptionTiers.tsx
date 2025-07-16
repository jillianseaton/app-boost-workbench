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
      description: 'Perfect for individuals getting started',
      features: [
        'Up to 5 optimization tasks per month',
        'Basic performance analytics',
        'Email support',
        'Access to standard algorithms',
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
      description: 'Great for small teams and growing businesses',
      features: [
        'Up to 25 optimization tasks per month',
        'Advanced performance analytics',
        'Priority email support',
        'Access to premium algorithms',
        'API access',
        'Custom reporting'
      ],
      popular: true,
      buttonText: 'Most Popular',
      buttonVariant: 'default' as const
    },
    {
      name: 'Professional',
      price: '$29.99',
      period: '/month',
      description: 'Ideal for professional developers and agencies',
      features: [
        'Up to 100 optimization tasks per month',
        'Real-time performance monitoring',
        'Live chat support',
        'Advanced AI algorithms',
        'White-label solutions',
        'Custom integrations',
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
      description: 'For large organizations with complex needs',
      features: [
        'Unlimited optimization tasks',
        'Enterprise-grade analytics',
        '24/7 phone support',
        'Custom algorithm development',
        'On-premise deployment',
        'SLA guarantees',
        'Multi-team collaboration',
        'Advanced security features'
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
            Choose Your Optimization Plan
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Scale your performance testing capabilities with our flexible subscription plans. 
            All plans include access to our advanced optimization algorithms.
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
            All plans include a 14-day free trial. No credit card required to start.
          </p>
        </div>
      </div>
    </section>
  );
};

export default IndexSubscriptionTiers;