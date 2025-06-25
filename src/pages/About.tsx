
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-4xl space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-primary">About EarnFlow</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed">
              EarnFlow is a platform that connects users with real earning opportunities through 
              affiliate partnerships and ad revenue sharing. We believe in transparent, fair compensation 
              for user engagement and provide secure payment processing through trusted partners.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
            <div className="space-y-3">
              <p className="text-gray-700">
                • Complete tasks and interact with partner advertisements
              </p>
              <p className="text-gray-700">
                • Earn commissions through verified affiliate partnerships
              </p>
              <p className="text-gray-700">
                • Receive secure payments via Stripe and other trusted processors
              </p>
              <p className="text-gray-700">
                • Track your earnings and payment history in real-time
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Privacy & Security</h2>
            <p className="text-gray-700 leading-relaxed">
              Your privacy is our priority. We collect minimal personal information, use industry-standard 
              encryption, and never sell your data to third parties. All payments are processed through 
              secure, PCI-compliant payment processors.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;
