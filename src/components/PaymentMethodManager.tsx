
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Settings, CreditCard } from 'lucide-react';
import { stripeAdvancedService, PaymentMethodConfiguration } from '@/services/stripeAdvancedService';

const PaymentMethodManager: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [accountId, setAccountId] = useState('');
  const [configurations, setConfigurations] = useState<PaymentMethodConfiguration[]>([]);
  const [updating, setUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  const getPaymentMethodConfigurations = async () => {
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
      const result = await stripeAdvancedService.getPaymentMethodConfigurations(accountId.trim());
      
      if (result.success && result.data) {
        setConfigurations(result.data);
        toast({
          title: "Payment Methods Loaded",
          description: `Found ${result.data.length} payment method configurations.`,
        });
      } else {
        throw new Error(result.error || 'Failed to get payment method configurations');
      }
    } catch (error) {
      console.error('Payment method config error:', error);
      toast({
        title: "Failed to Load Payment Methods",
        description: error instanceof Error ? error.message : "Failed to load configurations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentMethod = async (configId: string, paymentMethod: string, enabled: boolean) => {
    setUpdating(`${configId}-${paymentMethod}`);
    try {
      const result = await stripeAdvancedService.updatePaymentMethodConfiguration(
        accountId.trim(),
        configId,
        paymentMethod,
        enabled ? 'on' : 'off'
      );

      if (result.success) {
        // Refresh configurations
        await getPaymentMethodConfigurations();
        toast({
          title: "Payment Method Updated",
          description: `${paymentMethod} has been ${enabled ? 'enabled' : 'disabled'}.`,
        });
      } else {
        throw new Error(result.error || 'Failed to update payment method');
      }
    } catch (error) {
      console.error('Update payment method error:', error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update payment method",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const getPaymentMethodDisplayName = (key: string) => {
    const displayNames: { [key: string]: string } = {
      card: 'Credit/Debit Cards',
      affirm: 'Affirm',
      afterpay_clearpay: 'Afterpay/Clearpay',
      sepa_debit: 'SEPA Direct Debit',
      ideal: 'iDEAL',
      bancontact: 'Bancontact',
      sofort: 'Sofort',
      giropay: 'Giropay',
      eps: 'EPS',
      p24: 'Przelewy24',
      alipay: 'Alipay',
      wechat_pay: 'WeChat Pay',
      acss_debit: 'Pre-authorized Debit',
    };
    return displayNames[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Payment Method Configuration
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
          <Button onClick={getPaymentMethodConfigurations} disabled={loading || !accountId.trim()}>
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Load Payment Methods
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {configurations.map((config) => (
        <Card key={config.id}>
          <CardHeader>
            <CardTitle className="text-lg">
              {config.name} Configuration
              {config.is_default && <span className="text-sm text-muted-foreground ml-2">(Default)</span>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(config)
                .filter(([key, value]) => 
                  typeof value === 'object' && 
                  value !== null && 
                  'available' in value && 
                  'display_preference' in value
                )
                .map(([paymentMethod, methodConfig]: [string, any]) => (
                  <div key={paymentMethod} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{getPaymentMethodDisplayName(paymentMethod)}</p>
                      <p className="text-xs text-muted-foreground">
                        {methodConfig.available ? 'Available' : 'Not Available'}
                      </p>
                    </div>
                    <Switch
                      checked={methodConfig.display_preference?.value === 'on'}
                      onCheckedChange={(checked) => updatePaymentMethod(config.id, paymentMethod, checked)}
                      disabled={!methodConfig.available || updating === `${config.id}-${paymentMethod}`}
                    />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PaymentMethodManager;
