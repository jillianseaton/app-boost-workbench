
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet } from 'lucide-react';

interface KrakenBalancesProps {
  balances: { [currency: string]: string };
}

const KrakenBalances: React.FC<KrakenBalancesProps> = ({ balances }) => {
  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    return num > 0.001 ? num.toFixed(8) : num.toExponential(2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Account Balances
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(balances).map(([currency, balance]) => {
            const balanceNum = parseFloat(balance);
            if (balanceNum <= 0) return null;
            
            return (
              <div key={currency} className="p-3 bg-muted rounded-lg">
                <div className="font-medium">{currency}</div>
                <div className="text-sm text-muted-foreground">
                  {formatBalance(balance)}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default KrakenBalances;
