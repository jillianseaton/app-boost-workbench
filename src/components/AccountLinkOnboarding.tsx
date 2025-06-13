
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Link, ExternalLink } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { stripeAdvancedService } from '@/services/stripeAdvancedService';

const AccountLinkOnboarding: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [accountId, setAccountId] = useState('');
  const [collectionType, setCollectionType] = useState<'currently_due' | 'eventually_due'>('currently_due');
  const { toast } = useToast();

  const handleCreateAccountLink = async () => {
    if (!accountId.trim()) {
      toast({
        title: "Account ID Required",
        description: "Please enter a valid Stripe account ID.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await stripeAdvancedService.createAccountLink({
        accountId: accountId.trim(),
        refreshUrl: `${window.location.origin}/custom-stripe-onboarding?refresh=true`,
        returnUrl: `${window.location.origin}/custom-stripe-onboarding?success=true`,
        collectionType,
      });

      if (result.success && result.data) {
        // Open the account link in a new tab
        window.open(result.data.url, '_blank');
        
        toast({
          title: "Account Link Created",
          description: "Onboarding link opened in a new tab. Complete the process there.",
        });
      } else {
        throw new Error(result.error || 'Failed to create account link');
      }
    } catch (error) {
      console.error('Account link error:', error);
      toast({
        title: "Failed to Create Account Link",
        description: error instanceof Error ? error.message : "Failed to create account link",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-5 w-5" />
          Progressive Onboarding with Account Links
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="accountId">Stripe Account ID</Label>
          <Input
            id="accountId"
            placeholder="acct_xxxxxxxxxxxxx"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="space-y-3">
          <Label>Information Collection Type</Label>
          <RadioGroup
            value={collectionType}
            onValueChange={(value) => setCollectionType(value as 'currently_due' | 'eventually_due')}
            disabled={loading}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="currently_due" id="currently_due" />
              <Label htmlFor="currently_due" className="text-sm">
                Currently Due - Collect only immediately required information
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="eventually_due" id="eventually_due" />
              <Label htmlFor="eventually_due" className="text-sm">
                Eventually Due - Collect all required information upfront
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Button onClick={handleCreateAccountLink} disabled={loading || !accountId.trim()} className="w-full">
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating Account Link...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Create Onboarding Link
            </div>
          )}
        </Button>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Account Links:</strong> These provide a Stripe-hosted onboarding flow that's fully compliant
            and automatically handles all verification requirements. Perfect for progressive onboarding.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountLinkOnboarding;
