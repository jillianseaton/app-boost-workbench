
import React from 'react';
import CustomStripeOnboarding from '@/components/CustomStripeOnboarding';
import CustomAccountManager from '@/components/CustomAccountManager';
import AccountLinkOnboarding from '@/components/AccountLinkOnboarding';
import PaymentMethodManager from '@/components/PaymentMethodManager';
import CurrencyCheckoutDemo from '@/components/CurrencyCheckoutDemo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CustomStripeOnboardingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-primary mb-2">Advanced Stripe Connect</h1>
          <p className="text-muted-foreground">Complete Stripe Connect platform with advanced features</p>
        </div>

        <Tabs defaultValue="custom-onboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="custom-onboard">Custom Onboarding</TabsTrigger>
            <TabsTrigger value="account-links">Account Links</TabsTrigger>
            <TabsTrigger value="manage">Account Manager</TabsTrigger>
            <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
            <TabsTrigger value="currency-demo">Currency Demo</TabsTrigger>
          </TabsList>
          
          <TabsContent value="custom-onboard">
            <CustomStripeOnboarding />
          </TabsContent>
          
          <TabsContent value="account-links">
            <AccountLinkOnboarding />
          </TabsContent>
          
          <TabsContent value="manage">
            <CustomAccountManager />
          </TabsContent>
          
          <TabsContent value="payment-methods">
            <PaymentMethodManager />
          </TabsContent>
          
          <TabsContent value="currency-demo">
            <CurrencyCheckoutDemo />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CustomStripeOnboardingPage;
