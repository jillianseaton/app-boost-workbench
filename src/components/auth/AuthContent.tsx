import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, DollarSign, Clock, Users, Globe, Shield, Zap, Target } from 'lucide-react';

const AuthContent = () => {
  const benefits = [
    {
      icon: DollarSign,
      title: "Competitive Earnings",
      description: "Earn 5% commission on every completed task with instant Bitcoin conversion",
      details: [
        "Average $2-5 per task completion",
        "Automatic conversion to Bitcoin at market rates",
        "No minimum payout threshold",
        "Instant transfers to your wallet"
      ]
    },
    {
      icon: Clock,
      title: "Flexible Schedule",
      description: "Work whenever you want with 24/7 task availability",
      details: [
        "Access tasks anytime, anywhere",
        "No fixed hours or commitments",
        "Scale your earnings based on time invested",
        "Perfect for side income or full-time earning"
      ]
    },
    {
      icon: Users,
      title: "Premium Partnerships",
      description: "Work with top-tier advertisers and established brands",
      details: [
        "Fortune 500 company partnerships",
        "High-quality advertising campaigns",
        "Legitimate business opportunities",
        "Professional development exposure"
      ]
    },
    {
      icon: Shield,
      title: "Security First",
      description: "Enterprise-grade security protects your data and earnings",
      details: [
        "Bank-level encryption for all transactions",
        "Secure Bitcoin wallet integration",
        "Privacy-focused data collection",
        "Regular security audits and updates"
      ]
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: "Sign Up",
      description: "Create your account with just an email and basic information",
      icon: Target
    },
    {
      step: 2,
      title: "Browse Tasks",
      description: "Choose from available optimization tasks from our partner network",
      icon: Globe
    },
    {
      step: 3,
      title: "Complete Work",
      description: "Follow simple instructions to test and optimize applications",
      icon: Zap
    },
    {
      step: 4,
      title: "Get Paid",
      description: "Receive instant Bitcoin payments for completed tasks",
      icon: DollarSign
    }
  ];

  return (
    <div className="space-y-8">
      {/* How It Works Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          How EarnFlow Works
        </h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {howItWorks.map((step, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <step.icon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {step.step}
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">{step.title}</h4>
              <p className="text-sm text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Why Choose EarnFlow?
        </h3>
        <div className="grid gap-6 md:grid-cols-2">
          {benefits.map((benefit, index) => (
            <Card key={index} className="h-full">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <benefit.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{benefit.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {benefit.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {benefit.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{detail}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>
            Common questions about earning with our platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                How much can I earn?
              </h4>
              <p className="text-sm text-gray-700">
                Earnings vary based on task complexity and time invested. Most users earn 
                between $50-200 per week working part-time. Full-time participants can 
                earn significantly more, with top earners making over $1000 monthly.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                What types of tasks are available?
              </h4>
              <p className="text-sm text-gray-700">
                Tasks include application testing, user experience optimization, 
                performance monitoring, and advertisement interaction. All tasks are 
                legitimate business activities that help improve digital products and services.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                How do I receive payments?
              </h4>
              <p className="text-sm text-gray-700">
                Payments are made instantly in Bitcoin to your connected wallet. 
                You can also set up bank transfers or use integrated payment services 
                for traditional currency withdrawals.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Is my personal information safe?
              </h4>
              <p className="text-sm text-gray-700">
                We use enterprise-grade security measures and only collect essential 
                information needed for account management and payments. We never sell 
                personal data and comply with all privacy regulations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testimonials */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          What Our Users Say
        </h3>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-blue-600">JS</span>
              </div>
              <div>
                <p className="font-semibold text-sm">John S.</p>
                <div className="flex text-yellow-400">
                  {'★'.repeat(5)}
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-700">
              "Great platform for earning extra income. The Bitcoin payments are 
              instant and the tasks are straightforward."
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-green-600">MR</span>
              </div>
              <div>
                <p className="font-semibold text-sm">Maria R.</p>
                <div className="flex text-yellow-400">
                  {'★'.repeat(5)}
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-700">
              "I've been using EarnFlow for 6 months. Consistent earnings and 
              excellent customer support when needed."
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-purple-600">DK</span>
              </div>
              <div>
                <p className="font-semibold text-sm">David K.</p>
                <div className="flex text-yellow-400">
                  {'★'.repeat(5)}
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-700">
              "Perfect side hustle. I work on tasks during my commute and 
              weekends. Easy money with legitimate opportunities."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthContent;