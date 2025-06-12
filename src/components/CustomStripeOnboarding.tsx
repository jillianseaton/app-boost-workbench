
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CreditCard, Building, User, DollarSign } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { stripeCustomService } from '@/services/stripeCustomService';

interface CustomOnboardingData {
  // Business Profile
  productDescription: string;
  supportPhone: string;
  businessUrl: string;
  
  // Bank Account (External Account)
  accountHolderName: string;
  routingNumber: string;
  accountNumber: string;
  
  // Terms of Service Acceptance
  tosAccepted: boolean;
}

const CustomStripeOnboarding: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const { toast } = useToast();

  const form = useForm<CustomOnboardingData>({
    defaultValues: {
      productDescription: '',
      supportPhone: '',
      businessUrl: '',
      accountHolderName: '',
      routingNumber: '',
      accountNumber: '',
      tosAccepted: false,
    },
  });

  const onSubmit = async (data: CustomOnboardingData) => {
    if (!data.tosAccepted) {
      toast({
        title: "Terms Required",
        description: "You must accept the terms of service to continue.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Starting custom account onboarding:', data);
      
      // Create custom account and complete onboarding
      const result = await stripeCustomService.createAndOnboardCustomAccount({
        businessProfile: {
          productDescription: data.productDescription,
          supportPhone: data.supportPhone,
          url: data.businessUrl,
        },
        externalAccount: {
          accountHolderName: data.accountHolderName,
          routingNumber: data.routingNumber,
          accountNumber: data.accountNumber,
        },
        tosAcceptance: {
          userAgent: navigator.userAgent,
        },
      });

      if (result.success && result.data) {
        setAccountId(result.data.accountId);
        setOnboardingComplete(true);
        
        toast({
          title: "Account Created Successfully",
          description: "Your custom Stripe account has been set up and is ready for use.",
        });
      } else {
        throw new Error(result.error || 'Failed to create custom account');
      }
    } catch (error) {
      console.error('Custom onboarding error:', error);
      toast({
        title: "Onboarding Failed",
        description: error instanceof Error ? error.message : "Failed to complete onboarding",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (onboardingComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="container mx-auto max-w-2xl space-y-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-green-600">
                <CreditCard className="h-6 w-6" />
                Custom Account Setup Complete
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Your custom Stripe Connect account has been successfully created and configured.
              </p>
              {accountId && (
                <div className="p-4 bg-muted rounded-md">
                  <p className="text-sm font-medium">Account ID:</p>
                  <code className="text-xs bg-background px-2 py-1 rounded font-mono">
                    {accountId}
                  </code>
                </div>
              )}
              <Button onClick={() => window.location.href = '/'}>
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-2xl space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">Custom Account Setup</h1>
          <p className="text-muted-foreground">Complete your custom Stripe Connect account onboarding</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="productDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your business and the products/services you sell"
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="supportPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Support Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="businessUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Website</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://your-business.com"
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Bank Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="accountHolderName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Holder Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Doe or Business Name"
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="routingNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Routing Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="9-digit routing number"
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Bank account number"
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Terms and Conditions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="tosAccepted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={loading}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I accept the Stripe Connected Account Agreement and authorize this application to access my account
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Setting up account...
                </div>
              ) : (
                'Complete Custom Account Setup'
              )}
            </Button>
          </form>
        </Form>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Custom Account:</strong> This setup provides full control over the onboarding experience.
            All information is collected upfront to minimize future disruptions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomStripeOnboarding;
