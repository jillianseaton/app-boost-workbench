import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useENS } from '@/hooks/useENS';
import ENSDisplay from '@/components/ENSDisplay';
import { Wallet, Circle, Wifi, Plus } from 'lucide-react';

interface MultiWalletConnectorProps {
  selectedNetwork: string;
  onWalletConnect?: () => void;
}

const walletProviders = [
  { id: 'metamask', name: 'MetaMask', icon: '🦊' },
  { id: 'walletconnect', name: 'WalletConnect', icon: '🔗' },
  { id: 'coinbase', name: 'Coinbase Wallet', icon: '🔵' },
  { id: 'web3', name: 'Web3 Direct', icon: '🌐' },
  { id: 'custom', name: 'Custom Address', icon: '⚙️' },
];

const MultiWalletConnector: React.FC<MultiWalletConnectorProps> = ({
  selectedNetwork,
  onWalletConnect,
}) => {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [customAddress, setCustomAddress] = useState('');
  const [rpcUrl, setRpcUrl] = useState('');
  const { toast } = useToast();
  const { connectWallet, isLoading } = useMultiWallet();
  const { resolveAddress } = useENS();

  const handleConnect = async (providerId: string) => {
    if (providerId === 'custom') {
      if (!customAddress.trim()) {
        toast({
          title: "Error",
          description: "Please enter a valid address or ENS name",
          variant: "destructive",
        });
        return;
      }

      let finalAddress = customAddress;
      
      // Resolve ENS if needed
      if (customAddress.endsWith('.eth')) {
        const resolved = await resolveAddress(customAddress);
        if (!resolved) {
          toast({
            title: "Error",
            description: "Could not resolve ENS name",
            variant: "destructive",
          });
          return;
        }
        finalAddress = resolved;
      }

      const wallet = await connectWallet('custom', selectedNetwork, rpcUrl || undefined, finalAddress);
      if (wallet) {
        setCustomAddress('');
        onWalletConnect?.();
      }
      return;
    }

    setConnecting(providerId);
    try {
      const wallet = await connectWallet(providerId, selectedNetwork, rpcUrl || undefined);
      if (wallet) {
        onWalletConnect?.();
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
    } finally {
      setConnecting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Plus className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-medium text-blue-600">
          Add New Wallet Connection
        </span>
      </div>

      {/* Wallet Provider Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {walletProviders.filter(p => p.id !== 'custom').map((provider) => (
          <Button
            key={provider.id}
            variant="outline"
            className="h-16 flex flex-col gap-2 hover:bg-gray-50"
            onClick={() => handleConnect(provider.id)}
            disabled={connecting === provider.id || isLoading}
          >
            <span className="text-2xl">{provider.icon}</span>
            <span className="text-sm">
              {connecting === provider.id 
                ? 'Connecting...' 
                : provider.name}
            </span>
          </Button>
        ))}
      </div>

      {/* Web3 RPC Configuration */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Wifi className="h-4 w-4" />
          Web3 RPC Configuration (Optional)
        </h3>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="RPC URL (e.g., https://mainnet.infura.io/v3/YOUR_PROJECT_ID)"
            value={rpcUrl}
            onChange={(e) => setRpcUrl(e.target.value)}
            className="flex-1"
          />
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Providing an RPC URL enables additional features like custom networks and better balance fetching.
        </p>
      </div>

      {/* Custom Address Section */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Circle className="h-4 w-4" />
          Connect Custom Address (Read-Only)
        </h3>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Enter wallet address (0x...) or ENS name (alice.eth)"
              value={customAddress}
              onChange={(e) => setCustomAddress(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={() => handleConnect('custom')}
              disabled={!customAddress.trim() || isLoading}
            >
              <Wallet className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
          {customAddress && (
            <ENSDisplay 
              address={customAddress} 
              showAvatar={true}
              className="text-xs text-muted-foreground"
            />
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Custom addresses are added in read-only mode for portfolio tracking.
        </p>
      </div>
    </div>
  );
};

export default MultiWalletConnector;