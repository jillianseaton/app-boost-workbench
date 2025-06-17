
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface PartnerHeaderProps {
  partnerName: string;
  status: 'pending' | 'approved' | 'suspended';
}

const PartnerHeader: React.FC<PartnerHeaderProps> = ({ partnerName, status }) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">Partner Dashboard</h2>
        <p className="text-muted-foreground">Welcome back, {partnerName}</p>
      </div>
      <Badge variant={status === 'approved' ? 'default' : 'secondary'}>
        {status}
      </Badge>
    </div>
  );
};

export default PartnerHeader;
