import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { rubyBackendService } from '@/services/rubyBackendService';

const RUBY_BACKEND_URL = import.meta.env.VITE_RUBY_BACKEND_URL || 'http://localhost:4242';

const BackendStatus: React.FC = () => {
  const [backendStatus, setBackendStatus] = useState<'loading' | 'healthy' | 'unhealthy'>('loading');

  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const isHealthy = await rubyBackendService.checkHealth();
        setBackendStatus(isHealthy ? 'healthy' : 'unhealthy');
      } catch (error) {
        console.error('Failed to check backend health:', error);
        setBackendStatus('unhealthy');
      }
    };

    checkBackendHealth();
  }, []);

  const getStatusBadge = () => {
    switch (backendStatus) {
      case 'loading':
        return <Badge variant="secondary">Loading...</Badge>;
      case 'healthy':
        return <Badge variant="success">Healthy</Badge>;
      case 'unhealthy':
        return <Badge variant="destructive">Unhealthy</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <Card>
      <CardContent className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">Ruby Backend Status</h2>
          <p className="text-xs text-muted-foreground">
            Checking connection to: {RUBY_BACKEND_URL}
          </p>
        </div>
        {getStatusBadge()}
      </CardContent>
    </Card>
  );
};

export default BackendStatus;
