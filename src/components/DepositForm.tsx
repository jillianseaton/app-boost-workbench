
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';

interface DepositFormProps {
  depositAmount: string;
  onDepositAmountChange: (value: string) => void;
  currentBalance: number;
  amount: number;
  isValidAmount: boolean;
  getErrorMessage: () => string;
}

const DepositForm: React.FC<DepositFormProps> = ({
  depositAmount,
  onDepositAmountChange,
  currentBalance,
  amount,
  isValidAmount,
  getErrorMessage,
}) => {
  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="depositAmount">Deposit Amount (USD)</Label>
        <Input
          id="depositAmount"
          type="number"
          placeholder="Enter amount to deposit"
          value={depositAmount}
          onChange={(e) => onDepositAmountChange(e.target.value)}
          min="10"
          max={Math.min(currentBalance, 5000)}
          step="0.01"
          className={!isValidAmount && amount > 0 ? 'border-red-500' : ''}
        />
        {!isValidAmount && amount > 0 && (
          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            {getErrorMessage()}
          </p>
        )}
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Minimum: $10.00</p>
        <p>• Maximum per transaction: $5,000.00</p>
        <p>• Maximum per day: $10,000.00</p>
        <p>• Funds will be deducted from your EarnFlow balance immediately</p>
      </div>
    </div>
  );
};

export default DepositForm;
