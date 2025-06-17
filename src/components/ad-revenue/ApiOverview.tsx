
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ApiOverview: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Getting Started</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>
          Our API allows advertising partners to submit payments, query analytics, and manage their integration programmatically.
        </p>
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Base URL</h4>
          <code className="text-sm">https://your-domain.com/api/partners</code>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Response Format</h4>
          <p className="text-sm text-muted-foreground">All API responses are in JSON format.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiOverview;
