
import React, { useState } from 'react';
import CustomStripeOnboarding from '@/components/CustomStripeOnboarding';
import CustomAccountManager from '@/components/CustomAccountManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CustomStripeOnboardingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-primary mb-2">Custom Stripe Connect</h1>
          <p className="text-muted-foreground">Manage custom Stripe Connect accounts</p>
        </div>

        <Tabs defaultValue="onboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="onboard">Create New Account</TabsTrigger>
            <TabsTrigger value="manage">Manage Existing Account</TabsTrigger>
          </TabsList>
          
          <TabsContent value="onboard">
            <CustomStripeOnboarding />
          </TabsContent>
          
          <TabsContent value="manage">
            <CustomAccountManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CustomStripeOnboardingPage;
