
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit } from 'lucide-react';
import { BankAccount } from '@/services/secureBankService';

interface BankAccountsListProps {
  bankAccounts: BankAccount[];
  onUpdateAccount: (account: BankAccount) => void;
}

const BankAccountsList: React.FC<BankAccountsListProps> = ({
  bankAccounts,
  onUpdateAccount,
}) => {
  const getStatusBadge = (status: string) => {
    const colors = {
      verified: 'bg-green-100 text-green-800',
      verifying: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      pending: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  return (
    <div className="space-y-4">
      {bankAccounts.map((account) => (
        <Card key={account.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">{account.account_holder_name}</h4>
                <p className="text-sm text-muted-foreground">
                  {account.bank_name} • ****{account.account_number_last4}
                </p>
                <p className="text-xs text-muted-foreground">
                  Added {new Date(account.created_at).toLocaleDateString()}
                </p>
                {account.updated_by_user_at && (
                  <p className="text-xs text-orange-600">
                    Updated {new Date(account.updated_by_user_at).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusBadge(account.verification_status)}>
                  {account.verification_status}
                </Badge>
                {account.verification_status === 'verified' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onUpdateAccount(account)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Update
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BankAccountsList;
