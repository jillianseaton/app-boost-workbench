
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ApiAuthentication: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>API Authentication</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>
          All API requests require authentication using your API key in the Authorization header.
        </p>
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Header Format</h4>
          <code className="text-sm">Authorization: Bearer YOUR_API_KEY</code>
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold">Rate Limiting</h4>
          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
            <li>• 1000 requests per hour per API key</li>
            <li>• Rate limit headers included in all responses</li>
            <li>• 429 status code when limit exceeded</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiAuthentication;
