
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
        <PartnerServices />
        <PartnerAnalytics />
        <AffiliateDashboard />
      </main>
    </div>
  );
};

export default AffiliateRevenuePage;
