
import React from 'react';
import IndexHeader from '@/components/index/IndexHeader';
import IndexHero from '@/components/index/IndexHero';
import IndexPaymentCTA from '@/components/index/IndexPaymentCTA';
import IndexFeaturedServices from '@/components/index/IndexFeaturedServices';
import IndexDashboardLinks from '@/components/index/IndexDashboardLinks';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <IndexHeader />
      
      <main className="container mx-auto px-4 py-8">
        <IndexHero />
        <IndexPaymentCTA />
        <IndexFeaturedServices />
        <IndexDashboardLinks />
      </main>
    </div>
  );
};

export default Index;
