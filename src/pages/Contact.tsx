
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MessageSquare, Users, ExternalLink } from 'lucide-react';

const Contact = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-blue-700">
            EarnFlow
          </Link>
          <Link 
            to="/" 
            className="flex items-center gap-2 text-blue-500 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Contact Us
            </h1>
            <p className="text-xl text-gray-600">
              Get in touch with our team for support, partnerships, or questions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-xl p-8 shadow-md">
              <div className="flex items-center gap-3 mb-6">
                <Mail className="h-8 w-8 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">General Inquiries</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Support</h3>
                  <p className="text-gray-600">For technical support and account help</p>
                  <a href="mailto:support@earnflow.com" className="text-blue-600 hover:text-blue-700">
                    support@earnflow.com
                  </a>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Partnerships</h3>
                  <p className="text-gray-600">For affiliate partnership opportunities</p>
                  <a href="mailto:partnerships@earnflow.com" className="text-blue-600 hover:text-blue-700">
                    partnerships@earnflow.com
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-md">
              <div className="flex items-center gap-3 mb-6">
                <Users className="h-8 w-8 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-900">Partnership Info</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">CJ Affiliate Publisher</h3>
                  <p className="text-gray-600">Official CJ Affiliate Publisher ID</p>
                  <p className="text-green-600 font-mono">7602933</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Current Partners</h3>
                  <p className="text-gray-600">Active affiliate partnerships include:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 1-800-FLORALS (CJ Affiliate)</li>
                    <li>• Shopify Partners Program</li>
                    <li>• Max (HBO Max) Affiliate</li>
                    <li>• Canva Pro Partners</li>
                    <li>• Bluehost Affiliate Program</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-md mb-12">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="h-8 w-8 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How do I earn money with EarnFlow?</h3>
                <p className="text-gray-600">
                  Run optimization tasks that showcase our affiliate partners. Advertisers pay us for this exposure, 
                  and we share the revenue with users. Higher rates apply for CJ Affiliate partners.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Are the affiliate partnerships real?</h3>
                <p className="text-gray-600">
                  Yes! We're verified CJ Affiliate Publisher (ID: 7602933) with real partnerships including 
                  1-800-FLORALS, plus direct partnerships with Shopify, Max, Canva Pro, and others.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How much can I earn per task?</h3>
                <p className="text-gray-600">
                  Ad revenue ranges from $5-25 per optimization task, with higher rates for CJ Affiliate 
                  partners (our verified partnerships). Complete up to 20 tasks daily.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-blue-800 mb-6">
              Join our platform and start earning through verified affiliate partnerships today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/dashboard" 
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Access Dashboard
              </Link>
              <Link 
                to="/affiliate-revenue" 
                className="inline-flex items-center gap-2 border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                View Partners
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;
