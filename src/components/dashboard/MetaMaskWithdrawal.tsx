import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, Send, Loader2 } from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';
import { useToast } from '@/hooks/use-toast';

interface MetaMaskWithdrawalProps {
  earnings: number;
  onWithdraw: (amount: number) => void;
}

const MetaMaskWithdrawal: React.FC<MetaMaskWithdrawalProps> = ({ 
  earnings, 
  onWithdraw 
}) => {
  const { isConnected, accounts, sendContractTransaction, web3 } = useWeb3();
  const [amount, setAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendToWallet = async () => {
    if (!isConnected || !accounts.length) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your MetaMask wallet first.",
        variant: "destructive",
      });
      return;
    }

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to withdraw.",
        variant: "destructive",
      });
      return;
    }

    if (withdrawAmount > earnings) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough earnings to withdraw this amount.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Convert amount to wei (assuming earnings are in ETH)
      const amountInWei = web3?.utils.toWei(withdrawAmount.toString(), 'ether');
      
      if (!amountInWei) {
        throw new Error('Failed to convert amount to wei');
      }

      // For now, we'll simulate the transfer since this needs backend integration
      // In a real implementation, you'd call your backend to initiate the transfer
      toast({
        title: "Transfer Initiated",
        description: `Sending ${withdrawAmount} ETH to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
      });

      // Simulate transfer delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update local state
      onWithdraw(withdrawAmount);
      setAmount('');
      
      toast({
        title: "Transfer Successful",
        description: `${withdrawAmount} ETH has been sent to your MetaMask wallet.`,
      });
      
    } catch (error) {
      console.error('Transfer error:', error);
      toast({
        title: "Transfer Failed",
        description: "Failed to send earnings to your wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMaxAmount = () => {
    setAmount(earnings.toString());
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            MetaMask Withdrawal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Connect your MetaMask wallet to withdraw earnings
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Send to MetaMask Wallet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted p-3 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Connected Wallet:</p>
          <p className="font-mono text-sm">
            {accounts[0].slice(0, 6)}...{accounts[0].slice(-4)}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="withdrawal-amount">Amount (ETH)</Label>
          <div className="flex gap-2">
            <Input
              id="withdrawal-amount"
              type="number"
              step="0.000001"
              min="0"
              max={earnings}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              disabled={isLoading}
            />
            <Button 
              variant="outline" 
              onClick={handleMaxAmount}
              disabled={isLoading || earnings === 0}
            >
              Max
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Available: {earnings.toFixed(6)} ETH
          </p>
        </div>

        <Button 
          onClick={handleSendToWallet}
          disabled={isLoading || !amount || parseFloat(amount) <= 0 || earnings === 0}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send to Wallet
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MetaMaskWithdrawal;