
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, TrendingUp } from 'lucide-react';

const IndexDashboardLinks = () => {
  return (
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
  );
};

export default IndexDashboardLinks;
