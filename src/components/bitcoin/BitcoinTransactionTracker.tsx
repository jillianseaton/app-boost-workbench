import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, ExternalLink, Bitcoin, Clock, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface BitcoinTransaction {
  id: string;
  transaction_id: string;
  address: string;
  amount_btc: number;
  amount_satoshis: number;
  status: string;
  created_at: string;
  confirmations: number | null;
  block_height: number | null;
}

const BitcoinTransactionTracker: React.FC = () => {
  const [transactions, setTransactions] = useState<BitcoinTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTransactions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bitcoin_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch Bitcoin transactions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'converted':
        return <Bitcoin className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'converted':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const openBlockExplorer = (address: string, txId?: string) => {
    if (txId && !txId.startsWith('conversion_')) {
      // Real transaction - open transaction page
      window.open(`https://blockstream.info/tx/${txId}`, '_blank');
    } else {
      // Address or conversion - open address page
      window.open(`https://blockstream.info/address/${address}`, '_blank');
    }
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bitcoin Transaction Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please log in to view your Bitcoin transactions.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Bitcoin className="h-5 w-5" />
            Bitcoin Transaction History
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchTransactions} 
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <Bitcoin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No Bitcoin transactions found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Bitcoin conversions and transactions will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div key={tx.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(tx.status)}
                    <Badge variant={getStatusVariant(tx.status)}>
                      {tx.status.toUpperCase()}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(tx.created_at).toLocaleString()}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openBlockExplorer(tx.address, tx.transaction_id)}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Amount:</span>
                    <div className="font-mono font-medium">
                      {tx.amount_btc.toFixed(8)} BTC
                    </div>
                    <div className="text-muted-foreground">
                      ({tx.amount_satoshis.toLocaleString()} sats)
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Address:</span>
                    <div className="font-mono text-xs break-all">
                      {tx.address}
                    </div>
                  </div>
                </div>

                {tx.confirmations !== null && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Confirmations:</span>
                    <span className="ml-1 font-medium">{tx.confirmations}</span>
                  </div>
                )}

                <div className="text-sm">
                  <span className="text-muted-foreground">Transaction ID:</span>
                  <div className="font-mono text-xs break-all">
                    {tx.transaction_id}
                  </div>
                </div>

                {tx.status === 'converted' && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                    <p className="text-blue-800">
                      <strong>Commission Conversion:</strong> Your earnings were converted to Bitcoin equivalent. 
                      This is a simulated conversion - for actual Bitcoin delivery, please contact support.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2">How to Track Your Bitcoin:</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• <strong>Converted:</strong> Earnings converted to Bitcoin equivalent (simulated)</li>
            <li>• <strong>Pending:</strong> Transaction broadcast to network, waiting for confirmation</li>
            <li>• <strong>Confirmed:</strong> Transaction confirmed on the blockchain</li>
            <li>• <strong>Failed:</strong> Transaction failed to process</li>
          </ul>
          
          <div className="mt-3 pt-3 border-t">
            <p className="text-sm text-muted-foreground">
              <strong>Your Bitcoin Address:</strong> bc1qynefm4c3rwcwwclep6095dnjgatr9faz4rj0tn
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => openBlockExplorer('bc1qynefm4c3rwcwwclep6095dnjgatr9faz4rj0tn')}
            >
              View on Block Explorer <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BitcoinTransactionTracker;