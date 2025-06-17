
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  params: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
}

const ApiEndpointsList: React.FC = () => {
  const apiEndpoints: ApiEndpoint[] = [
    {
      method: 'POST',
      path: '/api/partners/payments',
      description: 'Submit a new payment',
      params: [
        { name: 'amount', type: 'integer', required: true, description: 'Amount in cents' },
        { name: 'campaign', type: 'string', required: true, description: 'Campaign name' },
        { name: 'description', type: 'string', required: false, description: 'Payment description' },
        { name: 'metadata', type: 'object', required: false, description: 'Additional metadata' }
      ]
    },
    {
      method: 'GET',
      path: '/api/partners/payments',
      description: 'List all payments',
      params: [
        { name: 'limit', type: 'integer', required: false, description: 'Number of results (max 100)' },
        { name: 'offset', type: 'integer', required: false, description: 'Pagination offset' },
        { name: 'campaign', type: 'string', required: false, description: 'Filter by campaign' }
      ]
    },
    {
      method: 'GET',
      path: '/api/partners/analytics',
      description: 'Get analytics data',
      params: [
        { name: 'period', type: 'string', required: false, description: 'Time period (7d, 30d, 90d)' },
        { name: 'group_by', type: 'string', required: false, description: 'Group by (day, week, month)' }
      ]
    }
  ];

  return (
    <div className="space-y-4">
      {apiEndpoints.map((endpoint, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Badge variant={endpoint.method === 'POST' ? 'default' : 'secondary'}>
                {endpoint.method}
              </Badge>
              <code className="text-sm">{endpoint.path}</code>
            </div>
            <p className="text-sm text-muted-foreground">{endpoint.description}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <h5 className="font-semibold">Parameters</h5>
              <div className="space-y-2">
                {endpoint.params.map((param, paramIndex) => (
                  <div key={paramIndex} className="flex items-start gap-3 text-sm">
                    <code className="bg-muted px-2 py-1 rounded text-xs min-w-fit">
                      {param.name}
                    </code>
                    <Badge variant="outline" className="text-xs">
                      {param.type}
                    </Badge>
                    {param.required && (
                      <Badge variant="destructive" className="text-xs">
                        Required
                      </Badge>
                    )}
                    <span className="text-muted-foreground">{param.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ApiEndpointsList;
