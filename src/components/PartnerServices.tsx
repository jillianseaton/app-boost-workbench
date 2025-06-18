
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { partnerServices } from '@/data/partnerServicesData';
import { useAffiliateTracking } from '@/hooks/useAffiliateTracking';
import PartnerServiceCard from './PartnerServiceCard';
import PartnershipInfo from './PartnershipInfo';

const PartnerServices: React.FC = () => {
  const { handlePurchase } = useAffiliateTracking();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Partner Affiliate Services
          <span className="text-sm font-normal text-muted-foreground ml-2">
            (Real affiliate partnerships - including CJ Affiliate network!)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partnerServices.map((service) => (
            <PartnerServiceCard
              key={service.id}
              service={service}
              onPurchase={handlePurchase}
            />
          ))}
        </div>
        
        <PartnershipInfo />
      </CardContent>
    </Card>
  );
};

export default PartnerServices;
