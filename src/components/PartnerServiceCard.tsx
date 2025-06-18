
import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, TrendingUp, Star, Clock, Shield } from 'lucide-react';
import { PartnerService } from '@/types/partnerService';
import { calculateCommission, formatPrice, getCategoryColor } from '@/utils/partnerServiceUtils';

interface PartnerServiceCardProps {
  service: PartnerService;
  onPurchase: (service: PartnerService) => void;
}

const PartnerServiceCard: React.FC<PartnerServiceCardProps> = ({ service, onPurchase }) => {
  return (
    <div className="relative p-6 border rounded-lg hover:shadow-lg transition-all duration-200 bg-white">
      {service.popularBadge && (
        <div className="absolute -top-2 left-4 bg-orange-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
          Popular Choice
        </div>
      )}
      
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-bold text-lg">{service.name}</h4>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(service.category)}`}>
            {service.category}
          </span>
          {service.cjAffiliateId && (
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
              CJ Affiliate
            </span>
          )}
        </div>
      </div>
      
      <p className="text-sm text-gray-700 font-medium mb-2">{service.product}</p>
      <p className="text-xs text-gray-600 mb-4 line-clamp-2">{service.description}</p>
      
      {/* Rating */}
      <div className="flex items-center gap-1 mb-3">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span className="text-sm font-medium">{service.rating}</span>
        <span className="text-xs text-gray-500">(Real reviews)</span>
        {service.epc && (
          <span className="text-xs text-blue-600 ml-2">EPC: {service.epc}</span>
        )}
      </div>

      {/* Features */}
      <div className="mb-4">
        <p className="text-xs font-medium text-gray-700 mb-2">Key Features:</p>
        <ul className="text-xs text-gray-600 space-y-1">
          {service.features.slice(0, 3).map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <div className="w-1 h-1 bg-green-500 rounded-full"></div>
              {feature}
            </li>
          ))}
        </ul>
      </div>
      
      {/* Pricing */}
      <div className="flex items-center justify-between mb-4">
        <div>
          {service.originalPrice && (
            <p className="text-xs text-gray-500 line-through">${service.originalPrice}</p>
          )}
          <p className="text-xl font-bold text-green-600">{formatPrice(service)}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-xs text-orange-600">
            <TrendingUp className="h-3 w-3" />
            <span>We earn ${calculateCommission(service.price, service.commissionRate)}</span>
          </div>
          <p className="text-xs text-gray-500">
            {(service.commissionRate * 100).toFixed(0)}% commission
          </p>
        </div>
      </div>
      
      {/* Billing Period Badge */}
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-3 w-3 text-blue-500" />
        <span className="text-xs text-blue-600 capitalize">
          {service.billingPeriod === 'one-time' ? 'One-time purchase' : `${service.billingPeriod} billing`}
        </span>
      </div>
      
      <Button 
        onClick={() => onPurchase(service)}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        size="sm"
      >
        <ExternalLink className="h-4 w-4 mr-2" />
        {service.billingPeriod === 'one-time' ? 'Buy Now' : 'Start Subscription'}
      </Button>
      
      <div className="mt-3 flex items-center justify-center gap-1 text-xs text-gray-500">
        <Shield className="h-3 w-3" />
        <span>Secure checkout via {service.name}</span>
      </div>
    </div>
  );
};

export default PartnerServiceCard;
