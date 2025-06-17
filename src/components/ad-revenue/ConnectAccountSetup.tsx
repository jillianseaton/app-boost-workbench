
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CreditCard, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adRevenueService } from '@/services/adRevenueService';

interface ConnectAccountSetupProps {
  onAccountCreated: (accountId: string) => void;
}

const ConnectAccountSetup: React.FC<ConnectAccountSetupProps> = ({ onAccountCreated }) => {
  const [loading, setLoading] = useState(false);
  const [businessEmail, setBusinessEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const { toast } = useToast();

  const handleCreateAccount = async () => {
    if (!businessEmail || !businessName) {
      toast({
        title: "Missing Information",
        description: "Please provide both business email and name.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await adRevenueService.createExpressAccount({
        email: businessEmail,
        businessName,
        businessType: 'company',
        country: 'US',
      });

      if (result.success && result.data) {
        onAccountCreated(result.data.accountId);
        
        if (result.data.onboardingUrl) {
          // Open onboarding in new tab if needed
          window.open(result.data.onboardingUrl, '_blank');
        }
        
        toast({
          title: "Account Created",
          description: "Your ad revenue collection account has been set up successfully.",
        });
      } else {
        throw new Error(result.error || 'Failed to create account');
      }
    } catch (error) {
      console.error('Account creation error:', error);
      toast({
        title: "Setup Failed",
        description: error instanceof Error ? error.message : "Failed to set up account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Building className="h-6 w-6" />
          Set Up Ad Revenue Collection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-center">
          Create a Stripe Connect Express account to start receiving payments from advertising partners.
        </p>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="businessEmail">Business Email</Label>
            <Input
              id="businessEmail"
              type="email"
              placeholder="your-business@example.com"
              value={businessEmail}
              onChange={(e) => setBusinessEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div>
            <Label htmlFor="businessName">Business Name</Label>
            <Input
              id="businessName"
              placeholder="Your Business Name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <Button 
            onClick={handleCreateAccount}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Setting up account...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Create Ad Revenue Account
              </>
            )}
          </Button>
        </div>
        
        <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>What happens next:</strong> We'll create a Stripe Connect Express account for your business.
            This allows you to receive payments from advertising partners and manage payouts to your bank account.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectAccountSetup;
