
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CreditCard, Smartphone, Send, Loader2, CheckCircle } from 'lucide-react';

type WithdrawalMethod = 'bank' | 'cashapp' | 'payout-link';

interface WithdrawalMethodSelectorProps {
  withdrawalMethod: WithdrawalMethod;
  onMethodChange: (method: WithdrawalMethod) => void;
  cashAppReady: boolean;
  statusLoading: boolean;
}

const WithdrawalMethodSelector: React.FC<WithdrawalMethodSelectorProps> = ({
  withdrawalMethod,
  onMethodChange,
  cashAppReady,
  statusLoading,
}) => {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Select Withdrawal Method</Label>
      <div className="grid grid-cols-3 gap-3">
        <Button
          variant={withdrawalMethod === 'bank' ? 'default' : 'outline'}
          onClick={() => onMethodChange('bank')}
          className="h-20 flex flex-col gap-1"
        >
          <CreditCard className="h-5 w-5" />
          <span className="text-xs">Bank Transfer</span>
          <span className="text-xs text-muted-foreground">1-2 days</span>
        </Button>
        <Button
          variant={withdrawalMethod === 'cashapp' ? 'default' : 'outline'}
          onClick={() => onMethodChange('cashapp')}
          className="h-20 flex flex-col gap-1"
        >
          <Smartphone className="h-5 w-5" />
          <span className="text-xs">Cash App Pay</span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            {statusLoading ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Checking...
              </>
            ) : cashAppReady ? (
              <>
                <CheckCircle className="h-3 w-3 text-green-500" />
                Ready
              </>
            ) : (
              'Setup Required'
            )}
          </span>
        </Button>
        <Button
          variant={withdrawalMethod === 'payout-link' ? 'default' : 'outline'}
          onClick={() => onMethodChange('payout-link')}
          className="h-20 flex flex-col gap-1"
        >
          <Send className="h-5 w-5" />
          <span className="text-xs">Payout Link</span>
          <span className="text-xs text-muted-foreground">Share & Pay</span>
        </Button>
      </div>
    </div>
  );
};

export default WithdrawalMethodSelector;
