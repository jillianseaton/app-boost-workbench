
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

        <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              EarnFlow is a platform that connects users with real earning opportunities through 
              affiliate partnerships and ad revenue sharing. We believe in transparent, fair compensation 
              for user engagement and provide secure payment processing through trusted partners.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Founded in 2024, our mission is to democratize online earning opportunities by creating 
              a transparent, secure platform where users can monetize their digital interactions while 
              helping businesses optimize their applications and services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900">Task-Based Earning</h3>
                <p className="text-gray-700">
                  Complete optimization tasks and interact with partner advertisements to earn commissions. 
                  Each task is designed to provide value to our business partners while rewarding users 
                  for their time and engagement.
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-gray-900">Verified Partnerships</h3>
                <p className="text-gray-700">
                  Work with established businesses and verified affiliate programs. Our partnership network 
                  includes Fortune 500 companies, innovative startups, and established e-commerce platforms.
                </p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold text-gray-900">Instant Payments</h3>
                <p className="text-gray-700">
                  Receive secure payments via Stripe and cryptocurrency options. Earnings are converted 
                  to Bitcoin automatically, providing users with digital asset accumulation opportunities.
                </p>
              </div>
              <div className="border-l-4 border-orange-500 pl-4">
                <h3 className="font-semibold text-gray-900">Real-Time Tracking</h3>
                <p className="text-gray-700">
                  Monitor your earnings and payment history with detailed analytics. Track your progress, 
                  optimize your earning strategy, and access comprehensive reporting tools.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Our Technology Stack</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Frontend Technologies</h3>
                <ul className="text-gray-700 space-y-1">
                  <li>• React 18 with TypeScript for type-safe development</li>
                  <li>• Tailwind CSS for responsive, modern design</li>
                  <li>• Vite for fast development and optimized builds</li>
                  <li>• React Router for seamless navigation</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Backend Infrastructure</h3>
                <ul className="text-gray-700 space-y-1">
                  <li>• Supabase for database and authentication</li>
                  <li>• Edge Functions for serverless processing</li>
                  <li>• PostgreSQL for reliable data storage</li>
                  <li>• Real-time subscriptions for live updates</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Privacy & Security</h2>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Your privacy is our priority. We collect minimal personal information, use industry-standard 
                encryption, and never sell your data to third parties. All payments are processed through 
                secure, PCI-compliant payment processors.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Data Protection</h4>
                  <p className="text-blue-800 text-sm">
                    End-to-end encryption, secure data storage, and GDPR compliance
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Payment Security</h4>
                  <p className="text-green-800 text-sm">
                    PCI DSS compliance, fraud detection, and secure payment processing
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">User Control</h4>
                  <p className="text-purple-800 text-sm">
                    Complete data transparency, opt-out options, and user-controlled privacy settings
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Company Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Transparency</h3>
                <p className="text-gray-700 text-sm">
                  Clear earning structures, honest partnership disclosures, and open communication 
                  about platform operations and policies.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Fairness</h3>
                <p className="text-gray-700 text-sm">
                  Equal opportunities for all users, fair compensation rates, and unbiased 
                  task distribution algorithms.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Innovation</h3>
                <p className="text-gray-700 text-sm">
                  Continuous platform improvement, adoption of new technologies, and development 
                  of better earning opportunities.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Security</h3>
                <p className="text-gray-700 text-sm">
                  Enterprise-grade security measures, regular security audits, and proactive 
                  protection against emerging threats.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Future Roadmap</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">Q1</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Mobile Application Launch</h4>
                  <p className="text-gray-700 text-sm">Native iOS and Android apps for on-the-go earning</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">Q2</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Advanced Analytics Dashboard</h4>
                  <p className="text-gray-700 text-sm">Comprehensive earning insights and optimization recommendations</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">Q3</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Expanded Partner Network</h4>
                  <p className="text-gray-700 text-sm">100+ new verified partners and international market expansion</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">Q4</div>
                <div>
                  <h4 className="font-semibold text-gray-900">AI-Powered Task Matching</h4>
                  <p className="text-gray-700 text-sm">Machine learning algorithms for personalized earning opportunities</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;
