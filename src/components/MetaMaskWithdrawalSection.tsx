
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, Send, Loader2, ExternalLink } from 'lucide-react';
import { useMetaMaskWithdrawal } from '@/hooks/useMetaMaskWithdrawal';
import { useMetaMaskWallet } from '@/hooks/useMetaMaskWallet';

interface MetaMaskWithdrawalSectionProps {
  earnings: number;
  tasksCompleted: number;
  hasWithdrawn: boolean;
  setEarnings: React.Dispatch<React.SetStateAction<number>>;
  setHasWithdrawn: React.Dispatch<React.SetStateAction<boolean>>;
  addTransaction: (transaction: any) => string;
  updateTransaction: (id: string, updates: any) => void;
  user: { phoneNumber: string; username: string };
}

const MetaMaskWithdrawalSection: React.FC<MetaMaskWithdrawalSectionProps> = ({ 
  earnings, 
  tasksCompleted,
  hasWithdrawn,
  setEarnings,
  setHasWithdrawn,
  addTransaction,
  updateTransaction,
  user
}) => {
  const { wallet, connectWallet, isConnecting } = useMetaMaskWallet();
  const { isWithdrawing, withdrawalAmount, handleMetaMaskWithdrawal } = useMetaMaskWithdrawal({
    earnings,
    tasksCompleted,
    setEarnings,
    setHasWithdrawn,
    addTransaction,
    updateTransaction,
    user
  });

  // Only show withdrawal section if all tasks completed and hasn't withdrawn
  if (tasksCompleted < 20 || hasWithdrawn) {
    return null;
  }

  const ethAmount = earnings / 2000; // This should use real-time ETH price in production

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-blue-500" />
          Cash Out to MetaMask
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Ready to withdraw ${earnings.toFixed(2)} ({ethAmount.toFixed(4)} ETH) to your MetaMask wallet
          </p>
        </div>

        {!wallet ? (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-md">
              <p className="text-blue-800 mb-2">Connect your MetaMask wallet to withdraw your earnings</p>
              <Button 
                onClick={connectWallet} 
                disabled={isConnecting}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="h-4 w-4 mr-2" />
                    Connect MetaMask
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-md">
              <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                Connected Wallet
              </h4>
              <p className="font-mono text-sm text-blue-700 break-all">
                {wallet.address}
              </p>
            </div>

            <div className="p-3 bg-orange-50 rounded-md">
              <p className="text-sm text-orange-800">
                <strong>Transaction Details:</strong>
                <br />• Amount: {ethAmount.toFixed(4)} ETH (${earnings.toFixed(2)} USD)
                <br />• Network: Ethereum
                <br />• Fee: ~0.001 ETH
              </p>
            </div>

            <Button 
              onClick={handleMetaMaskWithdrawal} 
              disabled={isWithdrawing}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {isWithdrawing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing Withdrawal...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Withdraw {ethAmount.toFixed(4)} ETH to MetaMask
                </>
              )}
            </Button>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>Network: Ethereum</span>
            <span>Currency: ETH</span>
          </div>
          <div className="flex items-center justify-center gap-2 mt-2">
            <ExternalLink className="h-3 w-3" />
            <span>Track on Etherscan after withdrawal</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetaMaskWithdrawalSection;
