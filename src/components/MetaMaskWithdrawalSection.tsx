
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, Send, Loader2, ExternalLink, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
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

  const ethAmount = earnings / 3000; // This will use real-time ETH price in the backend

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          Real ETH Withdrawal to MetaMask
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-green-600" />
            <strong className="text-green-800">REAL ETHEREUM MAINNET TRANSACTION</strong>
          </div>
          <p className="text-sm text-green-800">
            This will create an actual Ethereum transaction on mainnet. 
            Real ETH will be transferred to your MetaMask wallet address.
          </p>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Ready to withdraw ${earnings.toFixed(2)} (~{ethAmount.toFixed(6)} ETH) to your MetaMask wallet
          </p>
        </div>

        {!wallet ? (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-md">
              <p className="text-blue-800 mb-2">Connect your MetaMask wallet to receive real ETH</p>
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
                Connected Wallet (Ethereum Mainnet Required)
              </h4>
              <p className="font-mono text-sm text-blue-700 break-all">
                {wallet.address}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Balance: {wallet.balance} ETH
              </p>
            </div>

            <div className="p-3 bg-orange-50 rounded-md">
              <p className="text-sm text-orange-800">
                <strong>Real Transaction Details:</strong>
                <br />• Amount: ~{ethAmount.toFixed(6)} ETH (${earnings.toFixed(2)} USD)
                <br />• Network: Ethereum Mainnet
                <br />• Gas Fee: ~0.002 ETH (paid from hot wallet)
                <br />• Confirmation Time: 2-10 minutes
                <br />• This is a REAL money transaction
              </p>
            </div>

            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <strong className="text-red-800">IMPORTANT WARNING</strong>
              </div>
              <p className="text-sm text-red-800">
                This is a real blockchain transaction with real money. 
                Once confirmed, it cannot be reversed. Please verify your wallet address is correct.
              </p>
            </div>

            <Button 
              onClick={handleMetaMaskWithdrawal} 
              disabled={isWithdrawing}
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              {isWithdrawing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Broadcasting Real Transaction...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Real ETH (${earnings.toFixed(2)})
                </>
              )}
            </Button>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p className="text-center font-medium text-green-600">
            ✅ REAL ETHEREUM MAINNET TRANSACTION
          </p>
          <div className="flex justify-between">
            <span>Network: Ethereum Mainnet</span>
            <span>Currency: ETH</span>
          </div>
          <div className="flex items-center justify-center gap-2 mt-2">
            <ExternalLink className="h-3 w-3" />
            <span>Track on Etherscan after broadcast</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetaMaskWithdrawalSection;
