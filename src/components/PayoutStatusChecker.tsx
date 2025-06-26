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
  const [payoutDetails, setPayoutDetails] = useState<any[]>([]);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const checkPayoutStatus = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-payout-history', {
        body: { userEmail: user.email },
      });

      if (error) throw error;

      console.log('Full payout response:', data);
      
      setDebugInfo(data?.debug_info || null);

      if (data?.payouts && data.payouts.length > 0) {
        setPayoutDetails(data.payouts);
        
        console.log('Recent payouts found:', data.payouts.length);
        
        toast({
          title: "Payout History Retrieved",
          description: `Found ${data.payouts.length} recent payouts in your Stripe account`,
        });
      } else {
        setPayoutDetails([]);
        toast({
          title: "No Recent Payouts",
          description: "No payouts found in your Stripe account. This is normal if you haven't processed any payouts yet.",
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
          Recent Payout History
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
              Checking Recent Payouts...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Check Recent Payout History
            </>
          )}
        </Button>

        {debugInfo && payoutDetails.length === 0 && (
          <div className="border rounded-lg p-4 space-y-3 bg-blue-50">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-800">No Recent Payouts</h3>
            </div>
            
            <div className="text-sm text-blue-700 space-y-2">
              <p>No recent payouts found in your Stripe account</p>
              
              <div className="mt-3">
                <p className="font-medium mb-1">This could mean:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>No payouts have been processed recently</li>
                  <li>Payouts are processed on a different schedule</li>
                  <li>You're checking a different Stripe account</li>
                  <li>Payouts are managed through a different system</li>
                </ul>
              </div>
              
              <div className="mt-3 pt-3 border-t border-blue-200">
                <p className="text-xs">
                  Check your Stripe Dashboard directly at <a href="https://dashboard.stripe.com/payouts" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">dashboard.stripe.com/payouts</a>
                </p>
              </div>
            </div>
          </div>
        )}

        {payoutDetails.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Recent Payouts ({payoutDetails.length})</h3>
            {payoutDetails.slice(0, 5).map((payout, index) => (
              <div key={payout.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Payout #{index + 1}</h4>
                  {getStatusBadge(payout.status)}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Amount:</span>
                    <p className="font-medium">${(payout.amount / 100).toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <p className="flex items-center gap-1 font-medium">
                      {getStatusIcon(payout.status)}
                      {payout.status}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Created:</span>
                    <p className="font-medium">
                      {new Date(payout.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Arrival:</span>
                    <p className="font-medium">
                      {payout.arrival_date 
                        ? new Date(payout.arrival_date).toLocaleDateString()
                        : 'Not specified'}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  <p><strong>ID:</strong> {payout.id}</p>
                  {payout.description && (
                    <p><strong>Description:</strong> {payout.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="p-3 bg-blue-50 rounded-md text-sm">
          <p className="text-blue-800">
            <strong>About Payout Status:</strong>
          </p>
          <ul className="text-blue-700 mt-1 space-y-1">
            <li>• <strong>Paid:</strong> Successfully sent to your bank account</li>
            <li>• <strong>Pending:</strong> Being processed by Stripe</li>
            <li>• <strong>In Transit:</strong> On the way to your bank</li>
            <li>• <strong>Failed:</strong> Transfer failed, contact support</li>
          </ul>
          <p className="text-blue-600 mt-2 text-xs">
            This shows recent payouts from your connected Stripe account. Bank transfers typically take 1-3 business days to appear in your account.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PayoutStatusChecker;
