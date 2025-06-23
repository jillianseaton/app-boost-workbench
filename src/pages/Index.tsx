import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, TrendingUp, ExternalLink, LogIn, CreditCard } from 'lucide-react';
import { partnerServices } from '@/data/partnerServicesData';
import { useAffiliateTracking } from '@/hooks/useAffiliateTracking';
import { formatPrice, getCategoryColor } from '@/utils/partnerServiceUtils';
import StripePaymentButton from '@/components/StripePaymentButton';

const Index = () => {
  const { handlePurchase } = useAffiliateTracking();
  
  // Show only one-time purchase services (no subscriptions) - top 4
  const featuredServices = partnerServices
    .filter(service => service.billingPeriod === 'one-time')
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-blue-700">
            EarnFlow
          </Link>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link to="/payment" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  <CreditCard className="h-4 w-4" />
                  Make Payment
                </Link>
              </li>
              <li>
                <Link to="/auth" className="flex items-center gap-2 text-blue-500 hover:text-blue-700">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-blue-500 hover:text-blue-700">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/production-test" className="text-blue-500 hover:text-blue-700">
                  Production Test
                </Link>
              </li>
              <li>
                <Link to="/affiliate-revenue" className="text-blue-500 hover:text-blue-700">
                  Affiliate Partners
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-blue-500 hover:text-blue-700">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-blue-500 hover:text-blue-700">
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
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

        {/* Payment Call-to-Action */}
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

        {/* Featured Real Affiliate Services - One-time purchases only */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Featured Real Affiliate Partners (One-time Purchases)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredServices.map((service) => (
              <div key={service.id} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg">{service.name}</h3>
                  {service.cjAffiliateId && (
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                      CJ Affiliate
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-700 mb-2">{service.product}</p>
                <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(service.category)} mb-3 inline-block`}>
                  {service.category}
                </span>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xl font-bold text-green-600">
                    {formatPrice(service)}
                  </div>
                  <div className="text-xs text-orange-600">
                    {(service.commissionRate * 100).toFixed(0)}% commission
                  </div>
                </div>
                
                <button
                  onClick={() => handlePurchase(service)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all"
                >
                  <ExternalLink className="h-4 w-4" />
                  Shop Now
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          <Link
            to="/dashboard"
            className="group block p-8 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-green-200"
          >
            <div className="flex items-center justify-between mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-12 w-12 text-blue-600 group-hover:scale-110 transition-transform duration-300"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" x2="12" y1="3" y2="15"></line>
              </svg>
              <ArrowRight className="h-6 w-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-800 transition-colors">
              Task Dashboard
            </h3>
            <p className="text-gray-600 group-hover:text-gray-700 transition-colors">
              Manage tasks, track earnings, and optimize your workflow for maximum efficiency.
            </p>
            <div className="mt-4 text-sm text-blue-600 font-medium">
              → Access Dashboard
            </div>
          </Link>
          
          <Link
            to="/ad-revenue"
            className="group block p-8 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-green-200"
          >
            <div className="flex items-center justify-between mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-12 w-12 text-purple-600 group-hover:scale-110 transition-transform duration-300"
              >
                <path d="M12 5v14M5 12H19"></path>
              </svg>
              <ArrowRight className="h-6 w-6 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all duration-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-purple-800 transition-colors">
              Ad Revenue Collection
            </h3>
            <p className="text-gray-600 group-hover:text-gray-700 transition-colors">
              Collect ad revenue from multiple partners and manage your earnings efficiently.
            </p>
            <div className="mt-4 text-sm text-purple-600 font-medium">
              → Collect Revenue
            </div>
          </Link>
          
          <Link
            to="/secure-bank-transfer"
            className="group block p-8 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-green-200"
          >
            <div className="flex items-center justify-between mb-4">
              <Shield className="h-12 w-12 text-green-600 group-hover:scale-110 transition-transform duration-300" />
              <ArrowRight className="h-6 w-6 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all duration-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-green-800 transition-colors">
              Secure Bank Transfer Dashboard
            </h3>
            <p className="text-gray-600 group-hover:text-gray-700 transition-colors">
              Comprehensive bank account management with secure transfers, verification, and audit trails
            </p>
            <div className="mt-4 text-sm text-green-600 font-medium">
              → Access Dashboard
            </div>
          </Link>
          
          <Link
            to="/affiliate-revenue"
            className="group block p-8 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-green-200"
          >
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-12 w-12 text-orange-600 group-hover:scale-110 transition-transform duration-300" />
              <ArrowRight className="h-6 w-6 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all duration-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-orange-800 transition-colors">
              Affiliate Revenue Center
            </h3>
            <p className="text-gray-600 group-hover:text-gray-700 transition-colors">
              Earn commissions by recommending partner services to your users with full tracking
            </p>
            <div className="mt-4 text-sm text-orange-600 font-medium">
              → Start Earning
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Index;
