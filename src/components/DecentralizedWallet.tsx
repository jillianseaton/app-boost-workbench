import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Wallet, Shield, Circle, Settings } from 'lucide-react';
import WalletConnector from './wallet/WalletConnector';
import WalletDashboard from './wallet/WalletDashboard';
import NetworkSelector from './wallet/NetworkSelector';
import ContractInteraction from './wallet/ContractInteraction';

export interface WalletInfo {
  address: string;
  balance: string;
  network: string;
  connected: boolean;
}

const DecentralizedWallet: React.FC = () => {
  const [connectedWallets, setConnectedWallets] = useState<WalletInfo[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState('ethereum');
  const { toast } = useToast();

  const handleWalletConnect = (walletInfo: WalletInfo) => {
    setConnectedWallets(prev => [...prev, walletInfo]);
    toast({
      title: "Wallet Connected",
      description: `Successfully connected to ${walletInfo.network}`,
    });
  };

  const handleWalletDisconnect = (address: string) => {
    setConnectedWallets(prev => prev.filter(wallet => wallet.address !== address));
    toast({
      title: "Wallet Disconnected",
      description: "Wallet has been disconnected",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Connected Wallets</p>
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
                <p className="text-sm text-gray-600">Active Networks</p>
                <p className="text-3xl font-bold text-green-600">
                  {new Set(connectedWallets.map(w => w.network)).size}
                </p>
              </div>
              <Circle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Security Status</p>
                <p className="text-lg font-semibold text-purple-600">Protected</p>
              </div>
              <Shield className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Network Selection */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Network Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <NetworkSelector
            selectedNetwork={selectedNetwork}
            onNetworkChange={setSelectedNetwork}
          />
        </CardContent>
      </Card>

      {/* Wallet Connection */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Connect Wallet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WalletConnector
            selectedNetwork={selectedNetwork}
            onWalletConnect={handleWalletConnect}
          />
        </CardContent>
      </Card>

      {/* Smart Contract Interaction */}
      <ContractInteraction />

      {/* Connected Wallets Dashboard */}
      {connectedWallets.length > 0 && (
        <WalletDashboard
          wallets={connectedWallets}
          onDisconnect={handleWalletDisconnect}
        />
      )}
    </div>
  );
};

export default DecentralizedWallet;
