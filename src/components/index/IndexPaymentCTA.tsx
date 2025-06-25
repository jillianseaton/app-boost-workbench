
import React from 'react';
import { Link } from 'react-router-dom';
import { CreditCard } from 'lucide-react';

const IndexPaymentCTA = () => {
  return (
    <div className="mb-12 bg-white rounded-xl p-8 shadow-lg border">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          💳 Secure Payments Made Easy
        </h2>
        <p className="text-xl text-gray-600 mb-6">
          Make payments quickly and securely with our Stripe-powered payment system
        </p>
        <Link
          to="/payment"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all text-lg"
        >
          <CreditCard className="h-6 w-6" />
          Start Payment Process
        </Link>
      </div>
    </div>
  );
};

export default IndexPaymentCTA;
