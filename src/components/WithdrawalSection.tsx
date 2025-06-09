
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bitcoin, Send, Download, Loader2 } from 'lucide-react';

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
  const [withdrawType, setWithdrawType] = useState('ERC-20');
  const [currencyType] = useState('Bitcoin');

  // Debug logging
  console.log('WithdrawalSection - earnings:', earnings, 'tasksCompleted:', tasksCompleted, 'hasWithdrawn:', hasWithdrawn, 'isWithdrawing:', isWithdrawing);

  // Predefined wallet addresses for dropdown
  const walletOptions = [
    { label: 'Primary BTC Wallet', value: 'bc1qynefm4c3rwcwwclep6095dnjgatr9faz4rj0tn' },
    { label: 'Secondary BTC Wallet', value: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4' },
    { label: 'Cold Storage BTC', value: 'bc1qrp33g013s6g2s4q6fqfqcbx8dfgfqd3xw8zhvc' },
    { label: 'CashApp Wallet', value: 'cashapp' },
    { label: 'Custom BTC Address', value: 'custom' }
  ];

  const withdrawTypeOptions = [
    { label: 'Bitcoin Network (BTC)', value: 'BTC' },
    { label: 'CashApp Transfer', value: 'CASHAPP' },
    { label: 'ERC-20 Token', value: 'ERC-20' }
  ];

  const handleWalletSelect = (value: string) => {
    setSelectedWallet(value);
    if (value === 'cashapp') {
      setBitcoinAddress('');
      setWithdrawType('CASHAPP');
    } else if (value !== 'custom') {
      setBitcoinAddress(value);
      setWithdrawType('BTC');
    } else {
      setBitcoinAddress('');
      setWithdrawType('BTC');
    }
  };

  const handleWithdrawTypeChange = (value: string) => {
    setWithdrawType(value);
    if (value === 'CASHAPP') {
      setSelectedWallet('cashapp');
      setBitcoinAddress('');
    }
  };

  const handleWithdraw = () => {
    if (withdrawType === 'CASHAPP') {
      // For CashApp, we don't need a Bitcoin address
      if (tasksCompleted < 20) {
        return;
      }
      onWithdraw();
    } else {
      if (!bitcoinAddress.trim()) {
        return;
      }
      if (tasksCompleted < 20) {
        return;
      }
      onWithdraw();
    }
  };

  // Only show withdrawal section if all tasks completed and hasn't withdrawn
  if (tasksCompleted < 20 || hasWithdrawn) {
    return null;
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Bitcoin className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold">
              {withdrawType === 'CASHAPP' ? 'CashApp Withdrawal' : 'Bitcoin Withdrawal (Mainnet)'}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Ready to withdraw ${earnings.toFixed(2)} to your {withdrawType === 'CASHAPP' ? 'CashApp' : 'Bitcoin wallet'}
          </p>
          <div className="p-3 bg-blue-50 rounded-md mb-4">
            <p className="text-sm text-blue-800">
              <strong>Processing Time:</strong> {withdrawType === 'CASHAPP' 
                ? 'CashApp transfers are typically instant.' 
                : 'Bitcoin mainnet transactions typically take 10-60 minutes to confirm.'}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Withdraw Type</label>
              <Select value={withdrawType} onValueChange={handleWithdrawTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {withdrawTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Currency Type</label>
              <Input
                type="text"
                value={withdrawType === 'CASHAPP' ? 'USD (CashApp)' : currencyType}
                readOnly
                className="bg-muted text-muted-foreground"
              />
            </div>
          </div>

          {withdrawType !== 'CASHAPP' && (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">Select BTC Wallet</label>
                <Select value={selectedWallet} onValueChange={handleWalletSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a Bitcoin wallet or enter custom address" />
                  </SelectTrigger>
                  <SelectContent>
                    {walletOptions.filter(wallet => wallet.value !== 'cashapp').map((wallet) => (
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
            </>
          )}

          {withdrawType === 'CASHAPP' && (
            <div className="p-3 bg-green-50 rounded-md">
              <p className="text-sm text-green-800">
                <strong>CashApp Withdrawal:</strong> Funds will be transferred directly to your connected CashApp account.
                Make sure you have CashApp connected in the Bitcoin Wallet section.
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleWithdraw} 
            disabled={
              (withdrawType !== 'CASHAPP' && !bitcoinAddress.trim()) || 
              tasksCompleted < 20 || 
              isWithdrawing
            }
            className="flex-1"
            variant="default"
          >
            {isWithdrawing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Withdraw ${earnings.toFixed(2)} {withdrawType === 'CASHAPP' ? 'to CashApp' : 'BTC'}
              </>
            )}
          </Button>
          <Button 
            variant="outline"
            className="flex-1"
            disabled={
              (withdrawType !== 'CASHAPP' && !bitcoinAddress.trim()) || 
              isWithdrawing
            }
          >
            <Download className="h-4 w-4 mr-2" />
            Receive
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p className="text-center">Daily withdrawal required. Account will reset after withdrawal.</p>
          <div className="flex justify-between">
            <span>Withdraw Type: {withdrawType}</span>
            <span>Currency: {withdrawType === 'CASHAPP' ? 'USD' : currencyType}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WithdrawalSection;
