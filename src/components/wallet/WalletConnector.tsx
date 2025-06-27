
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Wallet, Circle } from 'lucide-react';
import { WalletInfo } from '../DecentralizedWallet';

interface WalletConnectorProps {
  selectedNetwork: string;
  onWalletConnect: (walletInfo: WalletInfo) => void;
}

const walletProviders = [
  { id: 'metamask', name: 'MetaMask', icon: '🦊' },
  { id: 'walletconnect', name: 'WalletConnect', icon: '🔗' },
  { id: 'coinbase', name: 'Coinbase Wallet', icon: '🔵' },
  { id: 'trust', name: 'Trust Wallet', icon: '🛡️' },
  { id: 'phantom', name: 'Phantom', icon: '👻' },
  { id: 'custom', name: 'Custom Address', icon: '⚙️' },
];

const WalletConnector: React.FC<WalletConnectorProps> = ({
  selectedNetwork,
  onWalletConnect,
}) => {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [customAddress, setCustomAddress] = useState('');
  const { toast } = useToast();

  const handleConnect = async (providerId: string) => {
    if (providerId === 'custom') {
      if (!customAddress.trim()) {
        toast({
          title: "Error",
          description: "Please enter a valid address",
          variant: "destructive",
        });
        return;
      }

      const walletInfo: WalletInfo = {
        address: customAddress,
        balance: '0.0000',
        network: selectedNetwork,
        connected: true,
      };

      onWalletConnect(walletInfo);
      setCustomAddress('');
      return;
    }

    setConnecting(providerId);
    
    // Simulate wallet connection
    setTimeout(() => {
      const mockAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
      const mockBalance = (Math.random() * 10).toFixed(4);
      
      const walletInfo: WalletInfo = {
        address: mockAddress,
        balance: mockBalance,
        network: selectedNetwork,
        connected: true,
      };

      onWalletConnect(walletInfo);
      setConnecting(null);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {walletProviders.filter(p => p.id !== 'custom').map((provider) => (
          <Button
            key={provider.id}
            variant="outline"
            className="h-16 flex flex-col gap-2 hover:bg-gray-50"
            onClick={() => handleConnect(provider.id)}
            disabled={connecting === provider.id}
          >
            <span className="text-2xl">{provider.icon}</span>
            <span className="text-sm">
              {connecting === provider.id ? 'Connecting...' : provider.name}
            </span>
          </Button>
        ))}
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Circle className="h-4 w-4" />
          Connect Custom Address
        </h3>
        <div className="flex gap-2">
          <Input
            placeholder="Enter wallet address (0x...)"
            value={customAddress}
            onChange={(e) => setCustomAddress(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={() => handleConnect('custom')}
            disabled={!customAddress.trim()}
          >
            <Wallet className="h-4 w-4 mr-2" />
            Connect
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WalletConnector;
