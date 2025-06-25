
import React from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, TrendingUp } from 'lucide-react';

const IndexHero = () => {
  return (
    <div className="text-center mb-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Real Affiliate Partnerships That Pay
      </h1>
      <p className="text-xl text-gray-600 mb-6">
        Shop with our verified partners and help us earn real commissions through CJ Affiliate and direct partnerships
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to="/payment"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all text-lg"
        >
          <CreditCard className="h-5 w-5" />
          Make a Payment
        </Link>
        <Link
          to="/affiliate-revenue"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
        >
          <TrendingUp className="h-5 w-5" />
          View All Partners
        </Link>
      </div>
    </div>
  );
};

export default IndexHero;
