
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Smartphone, Settings, Loader2, RefreshCw } from 'lucide-react';
import { CashAppOnboardingStatus } from '@/hooks/useCashAppStatus';

interface CashAppPaySectionProps {
  earnings: number;
  cashAppTag: string;
  onCashAppTagChange: (tag: string) => void;
  cashAppStatus: CashAppOnboardingStatus;
  cashAppLoading: boolean;
  setupLoading: boolean;
  statusLoading: boolean;
  cashAppReady: boolean;
  onWithdraw: () => void;
  onSetupStart: () => void;
  onStatusRefresh: () => void;
}

const CashAppPaySection: React.FC<CashAppPaySectionProps> = ({
  earnings,
  cashAppTag,
  onCashAppTagChange,
  cashAppStatus,
  cashAppLoading,
  setupLoading,
  statusLoading,
  cashAppReady,
  onWithdraw,
  onSetupStart,
  onStatusRefresh,
}) => {
  const formatCashAppTag = (value: string) => {
    let formatted = value.replace(/^\$+/, '');
    if (formatted && !formatted.startsWith('$')) {
      formatted = '$' + formatted;
    }
    return formatted;
  };

  return (
    <div className="space-y-3">
      <div className={`p-3 rounded-md ${cashAppReady ? 'bg-green-50' : 'bg-yellow-50'}`}>
        <div className="flex items-center justify-between">
          <p className={`text-sm ${cashAppReady ? 'text-green-800' : 'text-yellow-800'}`}>
            <strong>Cash App Status:</strong> {cashAppReady 
              ? 'Ready for instant payouts!' 
              : 'Setup required or pending verification.'
            }
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={onStatusRefresh}
            disabled={statusLoading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${statusLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        {cashAppStatus.requiresAction && (
          <p className="text-xs text-yellow-700 mt-1">
            Additional verification may be required. Please complete your onboarding.
          </p>
        )}
      </div>
      
      <div className="space-y-3">
        <div>
          <Label htmlFor="cashAppTagInput" className="text-sm font-medium mb-2 block">
            Your Cash App Tag
          </Label>
          <Input
            id="cashAppTagInput"
            type="text"
            placeholder="$username"
            value={cashAppTag}
            onChange={(e) => onCashAppTagChange(formatCashAppTag(e.target.value))}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Enter your Cash App $cashtag to enable payouts
          </p>
        </div>
        
        {!cashAppReady && (
          <Button
            onClick={onSetupStart}
            variant="outline"
            className="w-full"
            disabled={!cashAppTag.trim() || setupLoading}
          >
            {setupLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                <Settings className="h-4 w-4 mr-2" />
                Setup Cash App Payouts
              </>
            )}
          </Button>
        )}
      </div>

      <Button 
        onClick={onWithdraw} 
        disabled={cashAppLoading || !cashAppReady || !cashAppTag.trim()}
        className="w-full"
        variant="default"
      >
        {cashAppLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing Payout...
          </>
        ) : !cashAppReady ? (
          <>
            <Settings className="h-4 w-4 mr-2" />
            Complete Setup First
          </>
        ) : !cashAppTag.trim() ? (
          <>
            <Settings className="h-4 w-4 mr-2" />
            Enter Cash App Tag
          </>
        ) : (
          <>
            <Smartphone className="h-4 w-4 mr-2" />
            Send ${earnings.toFixed(2)} to Cash App
          </>
        )}
      </Button>
    </div>
  );
};

export default CashAppPaySection;
