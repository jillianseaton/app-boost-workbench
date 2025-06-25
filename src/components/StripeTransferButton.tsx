
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Send, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const StripeTransferButton: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [destination, setDestination] = useState('acct_1Rc3XE4Qs14JU3bp');
  const [transferGroup, setTransferGroup] = useState('ORDER100');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastTransfer, setLastTransfer] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleTransfer = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create transfers",
        variant: "destructive",
      });
      return;
    }

    const transferAmount = parseFloat(amount);
    if (!transferAmount || transferAmount < 0.5) {
      toast({
        title: "Invalid Amount",
        description: "Minimum transfer amount is $0.50",
        variant: "destructive",
      });
      return;
    }

    if (!destination) {
      toast({
        title: "Destination Required",
        description: "Please enter a destination account ID",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-stripe-transfer', {
        body: {
          amount: Math.round(transferAmount * 100), // Convert to cents
          currency: 'usd',
          destination: destination,
          transferGroup: transferGroup,
          description: `Transfer of $${transferAmount.toFixed(2)} to ${destination}`,
          userId: user.id,
        },
      });

      if (error) throw error;

      if (data?.success) {
        setLastTransfer(data.data);
        toast({
          title: "Transfer Created",
          description: `$${transferAmount.toFixed(2)} transfer initiated successfully`,
        });
        
        setAmount('');
      } else {
        throw new Error(data?.error || 'Transfer creation failed');
      }
    } catch (error) {
      console.error('Transfer error:', error);
      toast({
        title: "Transfer Failed",
        description: error instanceof Error ? error.message : "Failed to create transfer",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Stripe Transfer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="70.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.50"
              step="0.01"
            />
          </div>
          <div>
            <Label htmlFor="destination">Destination Account</Label>
            <Input
              id="destination"
              type="text"
              placeholder="acct_1Rc3XE4Qs14JU3bp"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="transferGroup">Transfer Group (Optional)</Label>
          <Input
            id="transferGroup"
            type="text"
            placeholder="ORDER100"
            value={transferGroup}
            onChange={(e) => setTransferGroup(e.target.value)}
          />
        </div>

        <Button 
          onClick={handleTransfer} 
          disabled={isProcessing || !amount || !destination}
          className="w-full"
        >
          {isProcessing ? (
            <>Processing...</>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Create Transfer
            </>
          )}
        </Button>

        {lastTransfer && (
          <div className="border rounded-lg p-4 space-y-3 bg-green-50">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-green-800">Transfer Created</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-green-700">Amount:</span>
                <p className="font-medium">${(lastTransfer.amount / 100).toFixed(2)}</p>
              </div>
              <div>
                <span className="text-green-700">Status:</span>
                <Badge className="bg-green-100 text-green-800">{lastTransfer.status}</Badge>
              </div>
              <div>
                <span className="text-green-700">Transfer ID:</span>
                <p className="font-medium text-xs">{lastTransfer.transferId}</p>
              </div>
              <div>
                <span className="text-green-700">Destination:</span>
                <p className="font-medium text-xs">{lastTransfer.destination}</p>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> This creates a direct transfer to the specified connected account using your live Stripe key. 
            The transfer will be processed immediately and funds will be available according to your account's payout schedule.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StripeTransferButton;
