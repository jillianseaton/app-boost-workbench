
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, DollarSign } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCommissions } from '@/hooks/useCommissions';
import { useToast } from '@/hooks/use-toast';

const TestCommissionAdder: React.FC = () => {
  const [adding, setAdding] = useState(false);
  const { user } = useAuth();
  const { addCommission } = useCommissions(user?.id);
  const { toast } = useToast();

  const testCommissions = [
    { amount: 250, description: 'Task completion bonus', source: 'task_completion' },
    { amount: 500, description: 'Affiliate sale commission', source: 'affiliate_sale' },
    { amount: 150, description: 'Referral bonus', source: 'referral_bonus' },
    { amount: 300, description: 'Ad revenue share', source: 'ad_revenue' },
  ];

  const addTestCommissions = async () => {
    if (!user) return;
    
    setAdding(true);
    try {
      for (const commission of testCommissions) {
        await addCommission(commission.amount, commission.description, commission.source);
      }
      
      toast({
        title: "Test Commissions Added",
        description: `Added ${testCommissions.length} test commissions totaling $${testCommissions.reduce((sum, c) => sum + c.amount, 0) / 100}`,
      });
    } catch (error) {
      console.error('Error adding test commissions:', error);
      toast({
        title: "Error",
        description: "Failed to add test commissions",
        variant: "destructive",
      });
    } finally {
      setAdding(false);
    }
  };

  if (!user) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Test Commission System
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Add test commissions to see how the payout system works. This will add sample earnings to your account.
          </p>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Test commissions to add:</p>
            <ul className="text-xs space-y-1">
              {testCommissions.map((commission, index) => (
                <li key={index} className="flex justify-between">
                  <span>{commission.description}</span>
                  <span className="font-medium">${(commission.amount / 100).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <Button 
            onClick={addTestCommissions} 
            disabled={adding}
            className="w-full"
          >
            {adding ? (
              <>Adding...</>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Test Commissions ($11.00 total)
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestCommissionAdder;
