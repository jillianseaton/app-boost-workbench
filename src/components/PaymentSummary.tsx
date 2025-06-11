
import React from 'react';

interface PaymentSummaryProps {
  amount: number;
  description: string;
}

const PaymentSummary: React.FC<PaymentSummaryProps> = ({ amount, description }) => {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">{description}</p>
      
      <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
        <div className="flex justify-between items-center">
          <span className="font-medium">Total Amount:</span>
          <span className="text-2xl font-bold text-primary">${amount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentSummary;
