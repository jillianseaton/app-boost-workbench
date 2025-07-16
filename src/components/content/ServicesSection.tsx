import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Smartphone, Shield, Zap, Globe, Code } from 'lucide-react';

const ServicesSection = () => {
  const services = [
    {
      icon: CreditCard,
      title: "Payment Processing",
      description: "Accept credit cards, debit cards, and ACH payments with competitive rates and instant settlements.",
      features: ["Visa, Mastercard, Amex", "Real-time processing", "Instant settlements", "Fraud protection"],
      pricing: "2.9% + 30¢ per transaction"
    },
    {
      icon: Smartphone,
      title: "Mobile Payments",
      description: "Enable contactless payments through Apple Pay, Google Pay, and other mobile wallet solutions.",
      features: ["Apple Pay", "Google Pay", "Samsung Pay", "Contactless NFC"],
      pricing: "2.9% + 30¢ per transaction"
    },
    {
      icon: Globe,
      title: "International Payments",
      description: "Process payments in 100+ currencies with automatic currency conversion and local payment methods.",
      features: ["100+ currencies", "Local payment methods", "Currency conversion", "Global compliance"],
      pricing: "3.4% + 30¢ per transaction"
    },
    {
      icon: Zap,
      title: "Instant Payouts",
      description: "Get your money faster with instant payouts to your bank account or debit card.",
      features: ["Instant transfers", "Bank account deposits", "Debit card payouts", "Real-time tracking"],
      pricing: "1.5% per instant payout"
    },
    {
      icon: Shield,
      title: "Fraud Protection",
      description: "Advanced machine learning algorithms protect against fraudulent transactions and chargebacks.",
      features: ["ML fraud detection", "Chargeback protection", "Risk scoring", "Real-time monitoring"],
      pricing: "Included with all plans"
    },
    {
      icon: Code,
      title: "Developer APIs",
      description: "Comprehensive APIs and SDKs for seamless integration into your applications and websites.",
      features: ["RESTful APIs", "SDKs for all platforms", "Webhooks", "Sandbox environment"],
      pricing: "Free with payment processing"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Comprehensive Payment Services
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Everything you need to accept, process, and manage payments online and in-person. 
            Our suite of services covers all aspects of modern payment processing.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow h-full">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <service.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </div>
                <CardDescription className="text-sm">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Features:</h4>
                    <div className="flex flex-wrap gap-1">
                      {service.features.map((feature, featureIndex) => (
                        <Badge key={featureIndex} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm font-semibold text-gray-900">
                      Pricing: <span className="text-blue-600">{service.pricing}</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Custom Enterprise Solutions
            </h3>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Need something more specific? We offer custom payment solutions for enterprise clients 
              including white-label processing, custom integrations, and dedicated support.
            </p>
            <div className="grid gap-4 md:grid-cols-3 max-w-3xl mx-auto">
              <div className="text-center">
                <h4 className="font-semibold text-gray-900 mb-1">Volume Discounts</h4>
                <p className="text-sm text-gray-600">Reduced rates for high-volume merchants</p>
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-gray-900 mb-1">Custom Integration</h4>
                <p className="text-sm text-gray-600">Tailored solutions for your specific needs</p>
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-gray-900 mb-1">Dedicated Support</h4>
                <p className="text-sm text-gray-600">Priority support with dedicated account manager</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;