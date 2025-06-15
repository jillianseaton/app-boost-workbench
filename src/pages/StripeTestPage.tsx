
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import StripeIntegrationTest from '@/components/StripeIntegrationTest';
import StripeChargeCapture from '@/components/StripeChargeCapture';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const StripeTestPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-4xl space-y-6">
        <div className="flex items-center gap-4">
          <Button onClick={() => navigate('/')} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-primary">Stripe Integration Test</h1>
        </div>

        <Tabs defaultValue="integration" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="integration">Integration Tests</TabsTrigger>
            <TabsTrigger value="capture">Charge Capture</TabsTrigger>
          </TabsList>
          
          <TabsContent value="integration" className="space-y-4">
            <StripeIntegrationTest />
          </TabsContent>
          
          <TabsContent value="capture" className="space-y-4">
            <StripeChargeCapture />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StripeTestPage;
