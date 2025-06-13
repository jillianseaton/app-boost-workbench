
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, Building, CreditCard, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { stripeConnectedAccountService, PrefilledAccountData } from '@/services/stripeConnectedAccountService';

const PrefilledAccountCreator: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [createdAccount, setCreatedAccount] = useState<any>(null);
  const { toast } = useToast();

  const form = useForm<PrefilledAccountData>({
    defaultValues: {
      email: '',
      country: 'US',
      accountType: 'express',
      businessType: 'individual',
      businessName: '',
      productDescription: '',
      supportEmail: '',
      supportPhone: '',
      websiteUrl: '',
      merchantCategoryCode: '5734', // Software
      firstName: '',
      lastName: '',
      companyName: '',
      taxId: '',
      userId: 'demo_user_123',
      platformSource: 'web_dashboard',
    },
  });

  const watchedAccountType = form.watch('accountType');
  const watchedBusinessType = form.watch('businessType');

  const onSubmit = async (data: PrefilledAccountData) => {
    setLoading(true);
    try {
      console.log('Creating connected account with data:', data);
      
      let result;
      switch (data.accountType) {
        case 'express':
          result = await stripeConnectedAccountService.createExpressAccount(data);
          break;
        case 'custom':
          result = await stripeConnectedAccountService.createCustomAccount(data);
          break;
        case 'standard':
          result = await stripeConnectedAccountService.createStandardAccount(data);
          break;
        default:
          throw new Error('Invalid account type');
      }

      if (result.success && result.data) {
        setCreatedAccount(result.data);
        toast({
          title: "Account Created Successfully",
          description: `${data.accountType} account created with ID: ${result.data.accountId}`,
        });
      } else {
        throw new Error(result.error || 'Failed to create account');
      }
    } catch (error) {
      console.error('Account creation error:', error);
      toast({
        title: "Account Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create connected account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (createdAccount) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <UserPlus className="h-5 w-5" />
              Connected Account Created Successfully
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Account ID</Label>
                <code className="block text-xs bg-muted p-2 rounded font-mono">
                  {createdAccount.accountId}
                </code>
              </div>
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <div className="flex gap-2 mt-1">
                  <Badge variant={createdAccount.chargesEnabled ? "default" : "secondary"}>
                    Charges: {createdAccount.chargesEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                  <Badge variant={createdAccount.payoutsEnabled ? "default" : "secondary"}>
                    Payouts: {createdAccount.payoutsEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>
            </div>

            {createdAccount.requirementsCurrentlyDue?.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Requirements Currently Due</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {createdAccount.requirementsCurrentlyDue.map((req: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {req}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {createdAccount.accountLinkUrl && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 mb-2">
                  <strong>Complete Onboarding:</strong> Click the link below to complete the account setup.
                </p>
                <Button 
                  onClick={() => window.open(createdAccount.accountLinkUrl, '_blank')}
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Complete Account Onboarding
                </Button>
              </div>
            )}

            <Button onClick={() => {
              setCreatedAccount(null);
              form.reset();
            }} variant="outline" className="w-full">
              Create Another Account
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Create Connected Account</h2>
        <p className="text-muted-foreground">
          Create Stripe connected accounts with prefilled information to streamline onboarding
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Account Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Account Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="accountType"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={loading}
                      >
                        <div className="space-y-4">
                          <div className="flex items-start space-x-3 p-4 border rounded-lg">
                            <RadioGroupItem value="express" id="express" className="mt-1" />
                            <div className="space-y-1">
                              <Label htmlFor="express" className="font-medium">Express Account</Label>
                              <p className="text-sm text-muted-foreground">
                                Stripe handles compliance and onboarding. Fastest integration with limited customization.
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3 p-4 border rounded-lg">
                            <RadioGroupItem value="custom" id="custom" className="mt-1" />
                            <div className="space-y-1">
                              <Label htmlFor="custom" className="font-medium">Custom Account</Label>
                              <p className="text-sm text-muted-foreground">
                                Full control over onboarding with maximum customization and compliance responsibility.
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3 p-4 border rounded-lg">
                            <RadioGroupItem value="standard" id="standard" className="mt-1" />
                            <div className="space-y-1">
                              <Label htmlFor="standard" className="font-medium">Standard Account</Label>
                              <p className="text-sm text-muted-foreground">
                                Users connect existing Stripe accounts. Minimal setup required.
                              </p>
                            </div>
                          </div>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="user@example.com" {...field} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={loading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="GB">United Kingdom</SelectItem>
                        <SelectItem value="AU">Australia</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Business Type */}
          <Card>
            <CardHeader>
              <CardTitle>Business Type</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="businessType"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={loading}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="individual" id="individual" />
                          <Label htmlFor="individual">Individual / Sole Proprietor</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="company" id="company" />
                          <Label htmlFor="company">Company / Corporation</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Business Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Business Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Corporation" {...field} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="supportEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Support Email</FormLabel>
                      <FormControl>
                        <Input placeholder="support@business.com" {...field} disabled={loading} />
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
                      <FormLabel>Support Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+1-555-123-4567" {...field} disabled={loading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="websiteUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://business.com" {...field} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Individual Information (for sole proprietors) */}
          {watchedBusinessType === 'individual' && (
            <Card>
              <CardHeader>
                <CardTitle>Individual Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} disabled={loading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} disabled={loading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Company Information (for companies) */}
          {watchedBusinessType === 'company' && (
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Legal Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Corporation LLC" {...field} disabled={loading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taxId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax ID / EIN</FormLabel>
                      <FormControl>
                        <Input placeholder="12-3456789" {...field} disabled={loading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating {watchedAccountType} Account...
              </div>
            ) : (
              `Create ${watchedAccountType} Connected Account`
            )}
          </Button>
        </form>
      </Form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Express Accounts</h4>
          <p className="text-sm text-blue-800">
            Perfect for marketplaces and platforms. Stripe handles most compliance requirements automatically.
          </p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h4 className="font-medium text-purple-900 mb-2">Custom Accounts</h4>
          <p className="text-sm text-purple-800">
            Full control over the user experience with complete onboarding customization.
          </p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="font-medium text-green-900 mb-2">Standard Accounts</h4>
          <p className="text-sm text-green-800">
            For users who already have Stripe accounts and want to connect them to your platform.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrefilledAccountCreator;
