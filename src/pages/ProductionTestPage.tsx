
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import ProductionConfigChecker from '@/components/ProductionConfigChecker';

const ProductionTestPage = () => {
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
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="h-8 w-8 text-green-600" />
              <h1 className="text-3xl font-bold text-gray-900">
                Production Configuration Test
              </h1>
            </div>
            <p className="text-xl text-gray-600">
              Test your live Stripe configuration and ensure your system is ready for production payments
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <ProductionConfigChecker />
          </div>

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">Testing Instructions:</h3>
            <ol className="list-decimal list-inside space-y-2 text-yellow-700">
              <li>Click "Run Production Configuration Check" to start the test</li>
              <li>The system will verify your live Stripe API connectivity</li>
              <li>Check if Cash App Pay is properly configured</li>
              <li>Review any issues or warnings that appear</li>
              <li>Follow the suggested solutions for any problems found</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductionTestPage;
