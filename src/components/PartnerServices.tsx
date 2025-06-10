
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

const PartnerServices: React.FC = () => {
  const thirdPartyApps = [
    { name: "StreamMax Pro", product: "Premium Streaming Service", price: 29.99 },
    { name: "FitTracker Elite", product: "Advanced Fitness Tracker", price: 199.99 },
    { name: "CloudSync Business", product: "Enterprise Cloud Storage", price: 49.99 },
    { name: "GameVault Premium", product: "Gaming Subscription", price: 19.99 },
    { name: "DesignSuite Pro", product: "Creative Design Tools", price: 89.99 },
    { name: "LearnHub Academy", product: "Online Course Platform", price: 39.99 }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Our Partner Services
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {thirdPartyApps.map((app, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <h4 className="font-semibold">{app.name}</h4>
              <p className="text-sm text-muted-foreground">{app.product}</p>
              <p className="text-sm font-bold text-green-600">${app.price}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PartnerServices;
