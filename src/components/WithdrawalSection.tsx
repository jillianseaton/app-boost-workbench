
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bitcoin, Send, Download } from 'lucide-react';

interface WithdrawalSectionProps {
  earnings: number;
  hasWithdrawn: boolean;
  onWithdraw: () => void;
}

const WithdrawalSection: React.FC<WithdrawalSectionProps> = ({ 
  earnings, 
  hasWithdrawn, 
  onWithdraw 
}) => {
  const [bitcoinAddress, setBitcoinAddress] = useState('');
  const [selectedWallet, setSelectedWallet] = useState('');

  // Debug logging
  console.log('WithdrawalSection - earnings:', earnings, 'hasWithdrawn:', hasWithdrawn);
  console.log('WithdrawalSection - should show?', earnings >= 10 && !hasWithdrawn);

  // Predefined wallet addresses for dropdown
  const walletOptions = [
    { label: 'Primary Wallet', value: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' },
    { label: 'Secondary Wallet', value: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2' },
    { label: 'Cold Storage', value: '1JfbZRwdDHKZmuiZgYArJZhcuuzuw2HuMu' },
    { label: 'Custom Address', value: 'custom' }
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
    onWithdraw();
  };

  // Temporarily show for testing - remove the earnings check
  if (hasWithdrawn) {
    return null;
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Bitcoin className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold">Bitcoin Withdrawal</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Ready to withdraw ${earnings.toFixed(2)} to your Bitcoin wallet
            {earnings < 10 && (
              <span className="block text-orange-600 mt-1">
                (Testing mode - normally requires $10.00 minimum)
              </span>
            )}
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Wallet</label>
            <Select value={selectedWallet} onValueChange={handleWalletSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a wallet or enter custom address" />
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
              <label className="text-sm font-medium mb-2 block">Bitcoin Address</label>
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
              <label className="text-sm font-medium mb-2 block">Selected Address</label>
              <div className="p-2 bg-muted rounded-md">
                <p className="font-mono text-xs break-all">{bitcoinAddress}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleWithdraw} 
            disabled={!bitcoinAddress.trim()}
            className="flex-1"
            variant="default"
          >
            <Send className="h-4 w-4 mr-2" />
            Send ${earnings.toFixed(2)}
          </Button>
          <Button 
            variant="outline"
            className="flex-1"
            disabled={!bitcoinAddress.trim()}
          >
            <Download className="h-4 w-4 mr-2" />
            Receive
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Daily withdrawal required. Account will reset after withdrawal.
        </p>
      </CardContent>
    </Card>
  );
};

export default WithdrawalSection;
