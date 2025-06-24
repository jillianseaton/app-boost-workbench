
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const PayoutStatusChecker: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [payoutDetails, setPayoutDetails] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const checkPayoutStatus = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-payout-history', {
        body: { userId: user.id },
      });

      if (error) throw error;

      if (data?.payouts && data.payouts.length > 0) {
        // Find the most recent payout
        const recentPayout = data.payouts[0];
        setPayoutDetails(recentPayout);
        
        console.log('Most recent payout details:', recentPayout);
        
        toast({
          title: "Payout Status Retrieved",
          description: `Latest payout: $${(recentPayout.amount / 100).toFixed(2)} - Status: ${recentPayout.status}`,
        });
      } else {
        toast({
          title: "No Payouts Found",
          description: "No payout history found for your account",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error checking payout status:', error);
      toast({
        title: "Error",
        description: "Failed to retrieve payout status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'in_transit':
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'in_transit':
        return <Badge className="bg-blue-100 text-blue-800">In Transit</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Payout Status Checker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={checkPayoutStatus} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Checking Status...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Check Latest Payout Status
            </>
          )}
        </Button>

        {payoutDetails && (
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Latest Payout Details</h3>
              {getStatusBadge(payoutDetails.status)}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Amount:</span>
                <p className="font-medium">${(payoutDetails.amount / 100).toFixed(2)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <p className="flex items-center gap-1 font-medium">
                  {getStatusIcon(payoutDetails.status)}
                  {payoutDetails.status}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Created:</span>
                <p className="font-medium">
                  {new Date(payoutDetails.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Arrival Date:</span>
                <p className="font-medium">
                  {payoutDetails.arrival_date 
                    ? new Date(payoutDetails.arrival_date).toLocaleDateString()
                    : 'Not specified'}
                </p>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              <p><strong>Payout ID:</strong> {payoutDetails.id}</p>
              {payoutDetails.description && (
                <p><strong>Description:</strong> {payoutDetails.description}</p>
              )}
            </div>

            <div className="p-3 bg-blue-50 rounded-md text-sm">
              <p className="text-blue-800">
                <strong>Status Explanation:</strong>
              </p>
              <ul className="text-blue-700 mt-1 space-y-1">
                <li>• <strong>Paid:</strong> Successfully sent to your bank account</li>
                <li>• <strong>Pending:</strong> Being processed by Stripe</li>
                <li>• <strong>In Transit:</strong> On the way to your bank</li>
                <li>• <strong>Failed:</strong> Transfer failed, contact support</li>
              </ul>
              <p className="text-blue-600 mt-2 text-xs">
                Bank transfers typically take 1-3 business days to appear in your account, even after showing as "Paid" in Stripe.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PayoutStatusChecker;
