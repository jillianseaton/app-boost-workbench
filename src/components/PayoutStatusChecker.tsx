
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, RefreshCw, ExternalLink, HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const PayoutStatusChecker: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [payoutDetails, setPayoutDetails] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
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

      console.log('Full payout response:', data);
      
      setDebugInfo(data?.debug_info || null);

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
        setPayoutDetails(null);
        toast({
          title: "Payout Search Complete",
          description: `Searched ${data?.debug_info?.total_stripe_payouts || 0} total payouts - none matched your account`,
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

        {debugInfo && !payoutDetails && (
          <div className="border rounded-lg p-4 space-y-3 bg-yellow-50">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-yellow-600" />
              <h3 className="font-semibold text-yellow-800">No Payouts Found</h3>
            </div>
            
            <div className="text-sm text-yellow-700 space-y-2">
              <p>Searched <strong>{debugInfo.total_stripe_payouts}</strong> total payouts in Stripe</p>
              <p>User ID searched: <code className="bg-yellow-100 px-1 rounded text-xs">{debugInfo.user_id_searched}</code></p>
              
              <div className="mt-3">
                <p className="font-medium mb-1">Possible reasons your payout isn't showing:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>The payout was processed through a different system</li>
                  <li>The payout metadata doesn't include your user ID</li>
                  <li>The payout is still being processed by Stripe</li>
                  <li>The payout was made to a different Stripe account</li>
                </ul>
              </div>
              
              <div className="mt-3 pt-3 border-t border-yellow-200">
                <p className="text-xs">
                  If you're expecting a recent payout, check your Stripe Dashboard or contact support with your User ID above.
                </p>
              </div>
            </div>
          </div>
        )}

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

            {payoutDetails.matching_strategy && (
              <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                <strong>Found via:</strong> {payoutDetails.matching_strategy.replace(/_/g, ' ')}
              </div>
            )}

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

        <div className="p-3 bg-gray-50 rounded-md text-xs text-gray-600">
          <p className="font-medium mb-1">Troubleshooting Tips:</p>
          <ul className="space-y-1">
            <li>• Bank transfers can take 1-3 business days even when marked "Paid"</li>
            <li>• Check your bank account for pending transactions</li>
            <li>• Verify the bank account details match your Stripe payout destination</li>
            <li>• Contact your bank if the transfer doesn't appear after 3 business days</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default PayoutStatusChecker;
