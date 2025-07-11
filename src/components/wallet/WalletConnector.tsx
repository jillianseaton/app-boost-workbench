
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useWeb3 } from '@/hooks/useWeb3';
import { Wallet, Circle, Wifi } from 'lucide-react';
import { WalletInfo } from '../DecentralizedWallet';

interface WalletConnectorProps {
  selectedNetwork: string;
  onWalletConnect: (walletInfo: WalletInfo) => void;
}

const walletProviders = [
  { id: 'metamask', name: 'MetaMask', icon: '🦊' },
  { id: 'walletconnect', name: 'WalletConnect', icon: '🔗' },
  { id: 'coinbase', name: 'Coinbase Wallet', icon: '🔵' },
  { id: 'web3', name: 'Web3 Direct', icon: '🌐' },
  { id: 'custom', name: 'Custom Address', icon: '⚙️' },
];

const WalletConnector: React.FC<WalletConnectorProps> = ({
  selectedNetwork,
  onWalletConnect,
}) => {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [customAddress, setCustomAddress] = useState('');
  const [rpcUrl, setRpcUrl] = useState('');
  const { toast } = useToast();
  const { connectWallet, accounts, getBalance, isConnected, isLoading } = useWeb3();

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

    if (providerId === 'web3' || providerId === 'metamask') {
      setConnecting(providerId);
      try {
        await connectWallet(rpcUrl || undefined);
        
        if (accounts.length > 0) {
          const balance = await getBalance(accounts[0]);
          const walletInfo: WalletInfo = {
            address: accounts[0],
            balance: balance,
            network: selectedNetwork,
            connected: true,
          };
          onWalletConnect(walletInfo);
          toast({
            title: "Wallet Connected",
            description: `Connected to ${accounts[0].slice(0, 10)}... on ${selectedNetwork}`,
          });
        }
      } catch (error) {
        console.error('Wallet connection failed:', error);
        toast({
          title: "Connection Failed",
          description: error instanceof Error ? error.message : "Failed to connect wallet",
          variant: "destructive",
        });
      } finally {
        setConnecting(null);
      }
      return;
    }

    setConnecting(providerId);
    
    // Simulate other wallet connections
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
            disabled={connecting === provider.id || (provider.id === 'web3' && isLoading)}
          >
            <span className="text-2xl">{provider.icon}</span>
            <span className="text-sm">
              {connecting === provider.id || (provider.id === 'web3' && isLoading) 
                ? 'Connecting...' 
                : provider.name}
            </span>
            {provider.id === 'web3' && isConnected && (
              <Wifi className="h-3 w-3 text-green-500" />
            )}
          </Button>
        ))}
      </div>

      {/* Web3 RPC Configuration */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Wifi className="h-4 w-4" />
          Web3 RPC Configuration
        </h3>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="RPC URL (optional - defaults to localhost:8545)"
            value={rpcUrl}
            onChange={(e) => setRpcUrl(e.target.value)}
            className="flex-1"
          />
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Leave empty to use wallet provider or default to localhost:8545
        </p>
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
