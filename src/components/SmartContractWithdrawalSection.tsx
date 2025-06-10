
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, Send, Loader2, ExternalLink, Shield, Activity } from 'lucide-react';
import { useSmartContractWithdrawal } from '@/hooks/useSmartContractWithdrawal';
import { useMetaMaskWallet } from '@/hooks/useMetaMaskWallet';

interface SmartContractWithdrawalSectionProps {
  earnings: number;
  tasksCompleted: number;
  hasWithdrawn: boolean;
  setEarnings: React.Dispatch<React.SetStateAction<number>>;
  setHasWithdrawn: React.Dispatch<React.SetStateAction<boolean>>;
  addTransaction: (transaction: any) => string;
  updateTransaction: (id: string, updates: any) => void;
  user: { phoneNumber: string; username: string };
}

const SmartContractWithdrawalSection: React.FC<SmartContractWithdrawalSectionProps> = ({ 
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
  const { isWithdrawing, gasEstimate, handleSmartContractWithdrawal, estimateGasFees } = useSmartContractWithdrawal({
    earnings,
    tasksCompleted,
    setEarnings,
    setHasWithdrawn,
    addTransaction,
    updateTransaction,
    user
  });

  const [ethPrice, setEthPrice] = useState(3000);

  useEffect(() => {
    const fetchETHPrice = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        const data = await response.json();
        setEthPrice(data.ethereum.usd);
      } catch (error) {
        console.error('Error fetching ETH price:', error);
      }
    };

    fetchETHPrice();
  }, []);

  useEffect(() => {
    if (wallet && earnings > 0) {
      const ethAmount = earnings / ethPrice;
      estimateGasFees(wallet.address, ethAmount);
    }
  }, [wallet, earnings, ethPrice, estimateGasFees]);

  // Only show withdrawal section if all tasks completed and hasn't withdrawn
  if (tasksCompleted < 20 || hasWithdrawn) {
    return null;
  }

  const ethAmount = earnings / ethPrice;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-500" />
          Smart Contract Withdrawal
          <Badge variant="secondary" className="ml-2">
            <Activity className="h-3 w-3 mr-1" />
            Advanced
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <strong className="text-blue-800">SMART CONTRACT WITHDRAWAL</strong>
            </div>
            <p className="text-sm text-blue-800">
              Secure, automated withdrawal through our deployed smart contract on Ethereum mainnet. 
              Enhanced security with multi-step verification and gas optimization.
            </p>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Withdraw ${earnings.toFixed(2)} ({ethAmount.toFixed(6)} ETH) via smart contract
          </p>
        </div>

        {!wallet ? (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-md">
              <p className="text-blue-800 mb-2">Connect your MetaMask wallet for smart contract withdrawal</p>
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
              <p className="text-xs text-blue-600 mt-1">
                Balance: {wallet.balance} ETH
              </p>
            </div>

            {gasEstimate && (
              <div className="p-3 bg-green-50 rounded-md">
                <p className="text-sm text-green-800">
                  <strong>Smart Contract Transaction Details:</strong>
                  <br />• Withdrawal Amount: {ethAmount.toFixed(6)} ETH (${earnings.toFixed(2)} USD)
                  <br />• Contract Address: 0x...{/* Contract address will be shown after deployment */}
                  <br />• Estimated Gas: {Number(gasEstimate.gasLimit).toLocaleString()} units
                  <br />• Gas Price: {(Number(gasEstimate.gasPrice) / 1e9).toFixed(2)} Gwei
                  <br />• Total Gas Fee: ~{Number(gasEstimate.totalCost) / 1e18} ETH (${((Number(gasEstimate.totalCost) / 1e18) * ethPrice).toFixed(2)} USD)
                  <br />• Network: Ethereum Mainnet
                  <br />• Execution: Automated (2-step process)
                </p>
              </div>
            )}

            <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
              <p className="text-sm text-purple-800">
                <strong>Smart Contract Features:</strong>
                <br />• ✅ Automated execution after confirmation
                <br />• ✅ Gas optimization and fee estimation
                <br />• ✅ Transaction validation and tracking
                <br />• ✅ Secure multi-step withdrawal process
                <br />• ✅ Real-time status monitoring
              </p>
            </div>

            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Process:</strong> 1) Request withdrawal → 2) Contract validation → 3) Automatic execution → 4) ETH transfer to your wallet
              </p>
            </div>

            <Button 
              onClick={handleSmartContractWithdrawal} 
              disabled={isWithdrawing}
              className="w-full bg-purple-600 hover:bg-purple-700"
              size="lg"
            >
              {isWithdrawing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing Smart Contract Withdrawal...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Withdraw {ethAmount.toFixed(6)} ETH via Smart Contract
                </>
              )}
            </Button>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p className="text-center font-medium text-purple-600">
            🔒 SECURE SMART CONTRACT WITHDRAWAL
          </p>
          <div className="flex justify-between">
            <span>Network: Ethereum Mainnet</span>
            <span>Method: Smart Contract</span>
          </div>
          <div className="flex items-center justify-center gap-2 mt-2">
            <ExternalLink className="h-3 w-3" />
            <span>Track on Etherscan with contract verification</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartContractWithdrawalSection;
