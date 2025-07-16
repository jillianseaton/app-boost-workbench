
import React from 'react';
import AffiliateDashboard from '@/components/AffiliateDashboard';
import PartnerServices from '@/components/PartnerServices';
import PartnerAnalytics from '@/components/PartnerAnalytics';

const AffiliateRevenuePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-purple-800">Affiliate Revenue Center</h1>
          <p className="text-purple-600 mt-1">Real partner integrations with detailed analytics and commission tracking</p>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Affiliate Program Information */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-purple-800 mb-4">How Affiliate Revenue Works</h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                Our affiliate revenue system connects you with verified partner programs that offer 
                real commissions for completed actions. Every partnership is thoroughly vetted to 
                ensure legitimate earning opportunities.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">Commission rates range from 5% to 25% per conversion</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">Real-time tracking and transparent reporting</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">Instant payment processing for verified commissions</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-purple-800 mb-4">Partner Network</h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                We maintain partnerships with over 50 established companies across various industries 
                including e-commerce, SaaS, financial services, and digital products.
              </p>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">50+</div>
                  <div className="text-sm text-purple-700">Active Partners</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">$2.5M</div>
                  <div className="text-sm text-purple-700">Paid to Users</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Success Stories */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-purple-800 mb-6">Success Stories</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="p-4 border-l-4 border-purple-500">
              <h3 className="font-semibold text-gray-900 mb-2">Sarah M. - Content Creator</h3>
              <p className="text-sm text-gray-700 mb-2">
                "I've earned over $3,200 in the last 6 months by promoting software tools to my audience. 
                The affiliate tracking is transparent and payments are always on time."
              </p>
              <div className="text-purple-600 font-semibold">Monthly Earnings: $580</div>
            </div>
            <div className="p-4 border-l-4 border-purple-500">
              <h3 className="font-semibold text-gray-900 mb-2">Mike R. - Digital Marketer</h3>
              <p className="text-sm text-gray-700 mb-2">
                "The variety of partner programs lets me match products with my different audiences. 
                High-quality partners mean better conversion rates and higher commissions."
              </p>
              <div className="text-purple-600 font-semibold">Monthly Earnings: $1,240</div>
            </div>
            <div className="p-4 border-l-4 border-purple-500">
              <h3 className="font-semibold text-gray-900 mb-2">Lisa K. - Blogger</h3>
              <p className="text-sm text-gray-700 mb-2">
                "Started part-time and now it's my main income source. The platform makes it easy 
                to find relevant products and track performance across all my affiliate links."
              </p>
              <div className="text-purple-600 font-semibold">Monthly Earnings: $2,100</div>
            </div>
          </div>
        </div>

        <PartnerServices />
        <PartnerAnalytics />
        <AffiliateDashboard />
      </main>
    </div>
  );
};

export default AffiliateRevenuePage;
