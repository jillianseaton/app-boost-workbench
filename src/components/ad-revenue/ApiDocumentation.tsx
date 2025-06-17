
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ApiOverview from './ApiOverview';
import ApiAuthentication from './ApiAuthentication';
import ApiEndpointsList from './ApiEndpointsList';
import ApiCodeExamples from './ApiCodeExamples';

const ApiDocumentation: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">API Documentation</h2>
        <p className="text-muted-foreground">
          Complete API reference for integrating with our ad revenue system.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="examples">Code Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <ApiOverview />
        </TabsContent>

        <TabsContent value="authentication" className="space-y-4">
          <ApiAuthentication />
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-4">
          <ApiEndpointsList />
        </TabsContent>

        <TabsContent value="examples" className="space-y-4">
          <ApiCodeExamples />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiDocumentation;
