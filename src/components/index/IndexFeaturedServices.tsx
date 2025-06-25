
import React from 'react';
import { ExternalLink } from 'lucide-react';
import { partnerServices } from '@/data/partnerServicesData';
import { useAffiliateTracking } from '@/hooks/useAffiliateTracking';
import { formatPrice, getCategoryColor } from '@/utils/partnerServiceUtils';

const IndexFeaturedServices = () => {
  const { handlePurchase } = useAffiliateTracking();
  
  // Show only one-time purchase services (no subscriptions) - top 4
  const featuredServices = partnerServices
    .filter(service => service.billingPeriod === 'one-time')
    .slice(0, 4);

  return (
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
  );
};

export default IndexFeaturedServices;
