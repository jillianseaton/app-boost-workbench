
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign, Zap, CheckCircle } from 'lucide-react';
import { useAutomaticPayout } from '@/hooks/useAutomaticPayout';

interface AutomaticPayoutSettingsProps {
  userId: string;
  userEmail: string;
  todaysEarnings: number;
}

const AutomaticPayoutSettings: React.FC<AutomaticPayoutSettingsProps> = ({
  userId,
  userEmail,
  todaysEarnings
}) => {
  const {
    config,
    updateConfig,
    isTransferring,
    lastTransferDate,
    shouldTransferToday,
    executeAutomaticTransfer
  } = useAutomaticPayout(userId, userEmail, todaysEarnings);

  const handleConfigChange = (field: string, value: any) => {
    updateConfig({ [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Automatic Daily Payouts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="auto-payout-enabled" className="text-base font-medium">
              Enable Automatic Payouts
            </Label>
            <p className="text-sm text-muted-foreground">
              Automatically transfer your daily earnings to Stripe
            </p>
          </div>
          <Switch
            id="auto-payout-enabled"
            checked={config.enabled}
            onCheckedChange={(checked) => handleConfigChange('enabled', checked)}
          />
        </div>

        {config.enabled && (
          <>
            {/* Minimum Amount Setting */}
            <div className="space-y-2">
              <Label htmlFor="minimum-amount">Minimum Amount ($)</Label>
              <Input
                id="minimum-amount"
                type="number"
                min="1"
                step="0.01"
                value={config.minimumAmount}
                onChange={(e) => handleConfigChange('minimumAmount', parseFloat(e.target.value) || 0)}
                placeholder="10.00"
              />
              <p className="text-xs text-muted-foreground">
                Only transfer when daily earnings reach this amount
              </p>
            </div>

            {/* Transfer Time Setting */}
            <div className="space-y-2">
              <Label htmlFor="transfer-time">Daily Transfer Time</Label>
              <Input
                id="transfer-time"
                type="time"
                value={config.transferTime}
                onChange={(e) => handleConfigChange('transferTime', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Time of day to automatically transfer earnings
              </p>
            </div>

            {/* Current Status */}
            <div className="p-4 bg-gray-50 rounded-lg space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Today's Status
              </h4>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Today's Earnings:</span>
                  <p className="font-medium">${todaysEarnings.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Transfer Status:</span>
                  <div className="flex items-center gap-2 mt-1">
                    {shouldTransferToday ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Ready
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        Waiting
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {lastTransferDate && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Last Transfer:</span>
                  <p className="font-medium">{new Date(lastTransferDate).toLocaleDateString()}</p>
                </div>
              )}
            </div>

            {/* Manual Transfer Button */}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Manual Transfer</p>
                <p className="text-xs text-muted-foreground">
                  Transfer today's earnings now
                </p>
              </div>
              <Button
                onClick={executeAutomaticTransfer}
                disabled={isTransferring || todaysEarnings < config.minimumAmount}
                size="sm"
              >
                {isTransferring ? 'Transferring...' : 'Transfer Now'}
              </Button>
            </div>
          </>
        )}

        {/* Information Note */}
        <div className="p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>How it works:</strong> Your daily earnings will be automatically transferred to your Stripe account 
            at the specified time, provided they meet the minimum amount requirement. Transfers are processed securely 
            through your connected Stripe account.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AutomaticPayoutSettings;
