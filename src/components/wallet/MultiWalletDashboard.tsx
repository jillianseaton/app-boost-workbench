import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useMultiWallet, ConnectedWallet } from '@/hooks/useMultiWallet';
import ENSDisplay from '@/components/ENSDisplay';
import { 
  Wallet, 
  Circle, 
  Shield, 
  Copy, 
  RefreshCw, 
  ExternalLink,
  Trash2,
  Eye,
  Network,
  CheckCircle
} from 'lucide-react';

const MultiWalletDashboard: React.FC = () => {
  const { 
    connectedWallets, 
    disconnectWallet, 
    updateWalletBalance,
    getWalletsByNetwork 
  } = useMultiWallet();
  const { toast } = useToast();

  const getNetworkColor = (network: string) => {
    const colors: Record<string, string> = {
      ethereum: 'bg-blue-500',
      bitcoin: 'bg-orange-500',
      polygon: 'bg-purple-500',
      binance: 'bg-yellow-500',
      avalanche: 'bg-red-500',
      solana: 'bg-green-500',
      arbitrum: 'bg-blue-400',
      optimism: 'bg-red-400',
    };
    return colors[network] || 'bg-gray-500';
  };

  const getProviderIcon = (provider: string) => {
    const icons: Record<string, string> = {
      metamask: '🦊',
      walletconnect: '🔗',
      coinbase: '🔵',
      web3: '🌐',
      custom: '⚙️',
    };
    return icons[provider] || '🔗';
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const handleRefreshBalance = async (wallet: ConnectedWallet) => {
    await updateWalletBalance(wallet.id);
    toast({
      title: "Balance Updated",
      description: `Refreshed balance for ${formatAddress(wallet.address)}`,
    });
  };

  const getNetworkExplorer = (network: string) => {
    const explorers: Record<string, string> = {
      ethereum: 'https://etherscan.io',
      polygon: 'https://polygonscan.com',
      binance: 'https://bscscan.com',
      avalanche: 'https://snowtrace.io',
      arbitrum: 'https://arbiscan.io',
      optimism: 'https://optimistic.etherscan.io',
    };
    return explorers[network] || 'https://etherscan.io';
  };

  const networkStats = connectedWallets.reduce((acc, wallet) => {
    acc[wallet.network] = (acc[wallet.network] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (connectedWallets.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="text-center py-8 text-gray-500">
            <Wallet className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Wallets Connected</h3>
            <p className="text-sm">Connect multiple wallets to manage your portfolio across different networks</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Wallets</p>
                <p className="text-3xl font-bold text-blue-600">{connectedWallets.length}</p>
              </div>
              <Wallet className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Networks</p>
                <p className="text-3xl font-bold text-green-600">
                  {Object.keys(networkStats).length}
                </p>
              </div>
              <Network className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Connections</p>
                <p className="text-3xl font-bold text-purple-600">
                  {connectedWallets.filter(w => w.web3Instance).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connected Wallets Grid */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Connected Wallets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {connectedWallets.map((wallet) => (
              <Card key={wallet.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header with Network and Provider */}
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${getNetworkColor(wallet.network)}`} />
                        {wallet.network}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <span className="text-lg">{getProviderIcon(wallet.provider)}</span>
                        {wallet.web3Instance && (
                          <Circle className="h-3 w-3 text-green-500 fill-current" />
                        )}
                      </div>
                    </div>
                    
                    {/* Address with ENS */}
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Address</p>
                      <div className="flex items-center gap-2">
                        <ENSDisplay 
                          address={wallet.address} 
                          showAvatar={true}
                          showFullAddress={false}
                          className="flex-1 text-sm"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(wallet.address, 'Address')}
                          className="h-7 w-7 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Balance */}
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Balance</p>
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-semibold">{wallet.balance}</p>
                        {wallet.web3Instance && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRefreshBalance(wallet)}
                            className="h-7 w-7 p-0"
                          >
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Network ID */}
                    {wallet.networkId && (
                      <div>
                        <p className="text-xs text-gray-600">Chain ID: {wallet.networkId}</p>
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          const explorer = getNetworkExplorer(wallet.network);
                          window.open(`${explorer}/address/${wallet.address}`, '_blank');
                        }}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Explorer
                      </Button>
                      {wallet.provider !== 'custom' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Details
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => disconnectWallet(wallet.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Network Summary */}
      {Object.keys(networkStats).length > 0 && (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Networks Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Object.entries(networkStats).map(([network, count]) => (
                <div key={network} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                  <div className={`w-3 h-3 rounded-full ${getNetworkColor(network)}`} />
                  <span className="text-sm font-medium capitalize">{network}</span>
                  <span className="text-xs text-gray-500">({count})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MultiWalletDashboard;