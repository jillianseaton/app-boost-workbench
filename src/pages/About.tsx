
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, Target, Award, Shield } from 'lucide-react';

const About = () => {
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
              About EarnFlow
            </h1>
            <p className="text-xl text-gray-600">
              Connecting users with real affiliate partnerships while earning ad revenue
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-xl p-8 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <Target className="h-8 w-8 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                We bridge the gap between users seeking quality services and trusted partners. 
                Through our CJ Affiliate network (Publisher ID: 7602933) and direct partnerships, 
                we help users discover premium services while generating sustainable ad revenue.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-8 w-8 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-900">How It Works</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Users run optimization tasks that showcase our affiliate partners. 
                Advertisers pay us for this exposure, creating a win-win ecosystem where 
                users earn money while discovering valuable services through our verified partnerships.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-md mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Award className="h-8 w-8 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Our Partnerships</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 border rounded-lg">
                <h3 className="font-semibold text-lg mb-2">CJ Affiliate Network</h3>
                <p className="text-sm text-gray-600">
                  Official publisher with verified affiliate partnerships including 1-800-FLORALS
                </p>
                <div className="mt-2 text-xs text-blue-600">
                  Publisher ID: 7602933
                </div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Direct Partners</h3>
                <p className="text-sm text-gray-600">
                  Premium services like Shopify, Max Streaming, Canva Pro, and Bluehost
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Revenue Sharing</h3>
                <p className="text-sm text-gray-600">
                  Transparent commission structure with real earnings from verified partnerships
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
            <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-900 mb-4">
              Verified & Secure
            </h2>
            <p className="text-green-800 mb-6">
              All our affiliate partnerships are verified and tracked through official networks. 
              Your data is secure, and all earnings are transparently tracked and reported.
            </p>
            <Link 
              to="/dashboard" 
              className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Start Earning Today
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;
