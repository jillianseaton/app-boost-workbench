
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bitcoin, Send, Download, Loader2, ExternalLink } from 'lucide-react';

interface WithdrawalSectionProps {
  earnings: number;
  tasksCompleted: number;
  hasWithdrawn: boolean;
  onWithdraw: () => void;
  isWithdrawing?: boolean;
}

const WithdrawalSection: React.FC<WithdrawalSectionProps> = ({ 
  earnings, 
  tasksCompleted,
  hasWithdrawn, 
  onWithdraw,
  isWithdrawing = false
}) => {
  const [bitcoinAddress, setBitcoinAddress] = useState('');
  const [selectedWallet, setSelectedWallet] = useState('');
  const [withdrawType, setWithdrawType] = useState('BTC');

  // Debug logging
  console.log('WithdrawalSection - earnings:', earnings, 'tasksCompleted:', tasksCompleted, 'hasWithdrawn:', hasWithdrawn, 'isWithdrawing:', isWithdrawing);

  // Predefined wallet addresses for dropdown
  const walletOptions = [
    { label: 'Primary BTC Wallet', value: 'bc1qynefm4c3rwcwwclep6095dnjgatr9faz4rj0tn' },
    { label: 'Secondary BTC Wallet', value: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4' },
    { label: 'Cold Storage BTC', value: 'bc1qrp33g013s6g2s4q6fqfqcbx8dfgfqd3xw8zhvc' },
    { label: 'Custom BTC Address', value: 'custom' }
  ];

  const handleWalletSelect = (value: string) => {
    setSelectedWallet(value);
    if (value !== 'custom') {
      setBitcoinAddress(value);
    } else {
      setBitcoinAddress('');
    }
  };

  const handleWithdraw = () => {
    if (!bitcoinAddress.trim()) {
      return;
    }
    if (tasksCompleted < 20) {
      return;
    }
    onWithdraw();
  };

  // Only show withdrawal section if all tasks completed and hasn't withdrawn
  if (tasksCompleted < 20 || hasWithdrawn) {
    return null;
  }

  const btcAmount = earnings / 45000; // Assuming $45k BTC price

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
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-md mb-4">
            <p className="text-sm text-orange-800">
              <strong>⚠️ REAL BITCOIN TRANSACTION:</strong> This will create an actual Bitcoin transaction on the mainnet. 
              Transaction fees apply and the transaction is irreversible. Typical confirmation time: 10-60 minutes.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-2 block">Select BTC Wallet</label>
            <Select value={selectedWallet} onValueChange={handleWalletSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a Bitcoin wallet or enter custom address" />
              </SelectTrigger>
              <SelectContent>
                {walletOptions.map((wallet) => (
                  <SelectItem key={wallet.value} value={wallet.value}>
                    {wallet.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(selectedWallet === 'custom' || selectedWallet === '') && (
            <div>
              <label className="text-sm font-medium mb-2 block">Receiving Bitcoin Address</label>
              <Input
                type="text"
                placeholder="Enter your Bitcoin address (starts with 1, 3, or bc1)"
                value={bitcoinAddress}
                onChange={(e) => setBitcoinAddress(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
          )}

          {selectedWallet && selectedWallet !== 'custom' && (
            <div>
              <label className="text-sm font-medium mb-2 block">Selected Bitcoin Address</label>
              <div className="p-2 bg-muted rounded-md">
                <p className="font-mono text-xs break-all">{bitcoinAddress}</p>
              </div>
            </div>
          )}

          <div className="p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Transaction Details:</strong>
              <br />• Amount: {btcAmount.toFixed(8)} BTC (${earnings.toFixed(2)} USD)
              <br />• Network: Bitcoin Mainnet
              <br />• Fee Rate: Medium (estimated 10-60 min confirmation)
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleWithdraw} 
            disabled={!bitcoinAddress.trim() || tasksCompleted < 20 || isWithdrawing}
            className="flex-1"
            variant="default"
          >
            {isWithdrawing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Bitcoin Transaction...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send {btcAmount.toFixed(8)} BTC
              </>
            )}
          </Button>
          <Button 
            variant="outline"
            className="flex-1"
            disabled={!bitcoinAddress.trim() || isWithdrawing}
          >
            <Download className="h-4 w-4 mr-2" />
            Receive
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p className="text-center font-medium text-orange-600">
            ⚠️ REAL MONEY TRANSACTION - VERIFY ADDRESS CAREFULLY
          </p>
          <div className="flex justify-between">
            <span>Network: Bitcoin Mainnet</span>
            <span>Currency: BTC</span>
          </div>
          <div className="flex items-center justify-center gap-2 mt-2">
            <ExternalLink className="h-3 w-3" />
            <span>Track on blockchain explorer after broadcast</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WithdrawalSection;
