
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bitcoin, Send, Loader2, ExternalLink, Shield, AlertTriangle } from 'lucide-react';
import { useRealBitcoinWithdrawal } from '@/hooks/useRealBitcoinWithdrawal';
import { WalletInfo, MultisigWallet } from '@/hooks/useWalletManager';

interface WithdrawalSectionProps {
  earnings: number;
  tasksCompleted: number;
  hasWithdrawn: boolean;
  selectedWallet: WalletInfo | MultisigWallet | null;
  setEarnings: React.Dispatch<React.SetStateAction<number>>;
  setHasWithdrawn: React.Dispatch<React.SetStateAction<boolean>>;
  addTransaction: (transaction: any) => string;
  updateTransaction: (id: string, updates: any) => void;
  user: { phoneNumber: string; username: string };
}

const WithdrawalSection: React.FC<WithdrawalSectionProps> = ({ 
  earnings, 
  tasksCompleted,
  hasWithdrawn, 
  selectedWallet,
  setEarnings,
  setHasWithdrawn,
  addTransaction,
  updateTransaction,
  user
}) => {
  const { isWithdrawing, withdrawalAmount, handleRealBitcoinWithdrawal } = useRealBitcoinWithdrawal({
    earnings,
    tasksCompleted,
    selectedWallet,
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

  const btcAmount = earnings / 45000; // Should use real-time price in production

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Bitcoin className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold">Real Bitcoin Withdrawal (Mainnet)</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Ready to withdraw ${earnings.toFixed(2)} ({btcAmount.toFixed(8)} BTC) to your Bitcoin wallet
          </p>
          
          <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <strong className="text-red-800">REAL BITCOIN TRANSACTION WARNING</strong>
            </div>
            <p className="text-sm text-red-800">
              This will create an actual Bitcoin transaction on mainnet with real money. 
              Transaction fees apply and the transaction is irreversible. 
              Typical confirmation time: 10-60 minutes.
            </p>
          </div>
        </div>

        {selectedWallet ? (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-md">
              <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                {selectedWallet.walletType === 'multisig' && <Shield className="h-4 w-4" />}
                Selected Wallet ({selectedWallet.walletType})
              </h4>
              <p className="font-mono text-sm text-blue-700 break-all">
                {selectedWallet.address}
              </p>
              {'requiredSignatures' in selectedWallet && (
                <p className="text-xs text-blue-600 mt-1">
                  {selectedWallet.requiredSignatures}-of-{selectedWallet.publicKeys.length} multisig wallet
                </p>
              )}
            </div>

            <div className="p-3 bg-orange-50 rounded-md">
              <p className="text-sm text-orange-800">
                <strong>Transaction Details:</strong>
                <br />• Amount: {btcAmount.toFixed(8)} BTC (${earnings.toFixed(2)} USD)
                <br />• Network: Bitcoin Mainnet
                <br />• Fee Rate: Medium priority
                <br />• Wallet Type: {selectedWallet.walletType}
                {selectedWallet.walletType === 'multisig' && (
                  <>
                    <br />• Signatures Required: {'requiredSignatures' in selectedWallet ? selectedWallet.requiredSignatures : 'N/A'}
                  </>
                )}
              </p>
            </div>

            <Button 
              onClick={handleRealBitcoinWithdrawal} 
              disabled={isWithdrawing}
              className="w-full bg-orange-600 hover:bg-orange-700"
              size="lg"
            >
              {isWithdrawing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Broadcasting to Bitcoin Network...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send {btcAmount.toFixed(8)} BTC (REAL TRANSACTION)
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="text-center p-4 bg-yellow-50 rounded-md">
            <p className="text-yellow-800 mb-2">No wallet selected for withdrawal</p>
            <p className="text-sm text-yellow-700">
              Please go to the Bitcoin Wallet page and select a wallet to receive your withdrawal.
            </p>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p className="text-center font-medium text-red-600">
            ⚠️ REAL MONEY TRANSACTION - VERIFY EVERYTHING CAREFULLY
          </p>
          <div className="flex justify-between">
            <span>Network: Bitcoin Mainnet</span>
            <span>Currency: BTC</span>
          </div>
          <div className="flex items-center justify-center gap-2 mt-2">
            <ExternalLink className="h-3 w-3" />
            <span>Track on mempool.space after broadcast</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WithdrawalSection;
