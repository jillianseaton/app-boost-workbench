import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Zap, Globe, Users, Award, TrendingUp } from 'lucide-react';

const AboutSection = () => {
  const features = [
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade encryption and security protocols protect every transaction and user interaction on our platform."
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Optimized payment processing with sub-second response times and 99.9% uptime guarantee."
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Support for 100+ currencies and payment methods across 190+ countries worldwide."
    },
    {
      icon: Users,
      title: "Developer Friendly",
      description: "Comprehensive APIs, SDKs, and documentation make integration simple and straightforward."
    },
    {
      icon: Award,
      title: "Compliance Ready",
      description: "PCI DSS Level 1 certified with full compliance for PSD2, GDPR, and regional regulations."
    },
    {
      icon: TrendingUp,
      title: "Scalable Solutions",
      description: "From startups to enterprises, our platform scales seamlessly with your business growth."
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            About Our Payment Platform
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We provide cutting-edge payment processing solutions that empower businesses to accept payments 
            securely and efficiently. Our platform combines traditional payment methods with modern 
            cryptocurrency solutions to offer comprehensive financial services.
          </p>
        </div>

        <div className="mb-16">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="mb-4 flex justify-center">
                    <feature.icon className="h-12 w-12 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg p-8 shadow-sm">
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Our Mission
              </h3>
              <p className="text-gray-700 mb-4">
                We believe that payment processing should be simple, secure, and accessible to businesses 
                of all sizes. Our mission is to democratize financial technology by providing 
                enterprise-grade payment solutions that are easy to implement and scale.
              </p>
              <p className="text-gray-700 mb-4">
                Since our founding, we've processed over $10 billion in transactions for more than 
                50,000 businesses worldwide. Our platform supports everything from simple one-time 
                payments to complex subscription models and marketplace solutions.
              </p>
              <p className="text-gray-700">
                We're committed to continuous innovation, regularly adding new features and payment 
                methods to help our customers stay ahead in an ever-evolving digital economy.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Industry Leadership
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-bold">99.9%</span>
                  </div>
                  <div>
                    <p className="font-semibold">Uptime Guarantee</p>
                    <p className="text-sm text-gray-600">Industry-leading reliability</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 font-bold">24/7</span>
                  </div>
                  <div>
                    <p className="font-semibold">Support Available</p>
                    <p className="text-sm text-gray-600">Always here when you need us</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 font-bold">190+</span>
                  </div>
                  <div>
                    <p className="font-semibold">Countries Supported</p>
                    <p className="text-sm text-gray-600">Global payment coverage</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;