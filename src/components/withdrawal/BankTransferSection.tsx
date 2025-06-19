
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Send, Settings, Loader2 } from 'lucide-react';

interface BankTransferSectionProps {
  earnings: number;
  loading: boolean;
  currencyType: string;
  onWithdraw: () => void;
  onSetup: () => void;
}

const BankTransferSection: React.FC<BankTransferSectionProps> = ({
  earnings,
  loading,
  currencyType,
  onWithdraw,
  onSetup,
}) => {
  return (
    <div className="space-y-3">
      <div className="p-3 bg-blue-50 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>Processing Time:</strong> Bank transfers typically take 1-2 business days to arrive. 
          Your withdrawal will be processed securely through Stripe.
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-sm font-medium mb-2 block">Withdrawal Type</Label>
          <Input
            type="text"
            value="Bank Transfer"
            readOnly
            className="bg-muted text-muted-foreground"
          />
        </div>
        <div>
          <Label className="text-sm font-medium mb-2 block">Currency Type</Label>
          <Input
            type="text"
            value={currencyType}
            readOnly
            className="bg-muted text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button 
          onClick={onWithdraw} 
          disabled={loading}
          className="flex-1"
          variant="default"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Withdraw ${earnings.toFixed(2)}
            </>
          )}
        </Button>
        <Button 
          onClick={onSetup}
          variant="outline"
          className="flex-1"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Setting up...
            </>
          ) : (
            <>
              <Settings className="h-4 w-4 mr-2" />
              Setup Bank Account
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default BankTransferSection;
