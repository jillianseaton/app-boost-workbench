
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Plus, ArrowUpRight, AlertTriangle } from 'lucide-react';

interface QuickActionsProps {
  verifiedAccountsCount: number;
  pendingAccountsCount: number;
  onNavigateToTab: (tab: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  verifiedAccountsCount,
  pendingAccountsCount,
  onNavigateToTab,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {verifiedAccountsCount === 0 ? (
          <Button onClick={() => onNavigateToTab('accounts')} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Bank Account
          </Button>
        ) : (
          <>
            <Button onClick={() => onNavigateToTab('transfer')} className="w-full">
              <ArrowUpRight className="h-4 w-4 mr-2" />
              Transfer to Bank Account
            </Button>
            <Button onClick={() => onNavigateToTab('accounts')} variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Another Account
            </Button>
          </>
        )}
        {pendingAccountsCount > 0 && (
          <Button onClick={() => onNavigateToTab('verification')} variant="outline" className="w-full">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Complete Verification ({pendingAccountsCount})
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickActions;
