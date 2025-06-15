
import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PayoutsSectionProps {
  stripeConnectInstance: any;
  showPayouts: boolean;
}

const PayoutsSection: React.FC<PayoutsSectionProps> = ({
  stripeConnectInstance,
  showPayouts
}) => {
  const payoutsContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (stripeConnectInstance && showPayouts && payoutsContainerRef.current) {
      try {
        // Clear any existing content
        payoutsContainerRef.current.innerHTML = '';
        
        // Create and append the payouts component
        const payouts = stripeConnectInstance.create('payouts');
        payoutsContainerRef.current.appendChild(payouts);
      } catch (error) {
        console.error('Error creating payouts component:', error);
        toast({
          title: "Payouts Error",
          description: "Failed to load payouts component",
          variant: "destructive",
        });
      }
    }
  }, [stripeConnectInstance, showPayouts, toast]);

  if (!showPayouts) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Payouts Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Manage your payouts, view payout schedules, and configure external accounts for receiving funds.
          </p>
          <div 
            ref={payoutsContainerRef}
            className="min-h-[400px] border rounded-md p-4 bg-background"
          >
            {/* Payouts component will be rendered here */}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PayoutsSection;
