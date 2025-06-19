
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Smartphone, ExternalLink, AlertCircle } from 'lucide-react';
import { useCashAppPayout } from '@/hooks/useCashAppPayout';

interface CashAppSetupProps {
  userEmail: string;
  userId: string;
  onSetupComplete?: (connectAccountId: string) => void;
  onStatusUpdate?: () => void;
}

const CashAppSetup: React.FC<CashAppSetupProps> = ({
  userEmail,
  userId,
  onSetupComplete,
  onStatusUpdate
}) => {
  const [cashAppTag, setCashAppTag] = useState('');
  const { setupLoading, setupCashAppAccount } = useCashAppPayout();

  const handleSetupCashApp = async () => {
    if (!cashAppTag.trim()) {
      return;
    }
    
    try {
      const result = await setupCashAppAccount(userEmail, userId, cashAppTag);
      if (result.connectAccountId) {
        console.log('CashAppSetup: Setup completed, triggering status update');
        
        if (onSetupComplete) {
          onSetupComplete(result.connectAccountId);
        }
        
        // Trigger status refresh after a short delay to allow Stripe to update
        if (onStatusUpdate) {
          setTimeout(() => {
            console.log('CashAppSetup: Triggering delayed status update');
            onStatusUpdate();
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Cash App setup failed:', error);
    }
  };

  const formatCashAppTag = (value: string) => {
    // Ensure it starts with $ and remove any extra $
    let formatted = value.replace(/^\$+/, '');
    if (formatted && !formatted.startsWith('$')) {
      formatted = '$' + formatted;
    }
    return formatted;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Setup Cash App Payouts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800 font-medium">Cash App Payout Setup</p>
              <p className="text-sm text-blue-700 mt-1">
                To receive payouts via Cash App, you'll need to complete Stripe's onboarding process. 
                This connects your Cash App account securely through Stripe Connect.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <Label htmlFor="cashAppTag" className="text-sm font-medium">
              Your Cash App Tag
            </Label>
            <Input
              id="cashAppTag"
              type="text"
              placeholder="$username"
              value={cashAppTag}
              onChange={(e) => setCashAppTag(formatCashAppTag(e.target.value))}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter your Cash App $cashtag (e.g., $johnsmith)
            </p>
          </div>

          <Button
            onClick={handleSetupCashApp}
            disabled={!cashAppTag.trim() || setupLoading}
            className="w-full"
          >
            {setupLoading ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Setting up...
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4 mr-2" />
                Setup Cash App Payouts
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>What happens next:</strong></p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>You'll be redirected to Stripe's secure onboarding</li>
            <li>Connect your Cash App account through Stripe</li>
            <li>Complete identity verification</li>
            <li>Start receiving instant Cash App payouts</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default CashAppSetup;
