import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Wallet, Shield, Circle, Settings, Plus } from 'lucide-react';
import MultiWalletConnector from './wallet/MultiWalletConnector';
import MultiWalletDashboard from './wallet/MultiWalletDashboard';
import NetworkSelector from './wallet/NetworkSelector';
import ContractInteraction from './wallet/ContractInteraction';
import { useMultiWallet } from '@/hooks/useMultiWallet';

export interface WalletInfo {
  address: string;
  balance: string;
  network: string;
  connected: boolean;
}

const DecentralizedWallet: React.FC = () => {
  const [selectedNetwork, setSelectedNetwork] = useState('ethereum');
  const [showConnector, setShowConnector] = useState(false);
  const { connectedWallets } = useMultiWallet();
  const { toast } = useToast();

  const handleWalletConnect = () => {
    setShowConnector(false);
    toast({
      title: "Wallet Connected",
      description: `Successfully connected to ${selectedNetwork}`,
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

      {/* Add Wallet Button */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="text-center">
            <Button
              onClick={() => setShowConnector(!showConnector)}
              className="flex items-center gap-2"
              size="lg"
            >
              <Plus className="h-5 w-5" />
              {showConnector ? 'Hide Wallet Connector' : 'Connect New Wallet'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Connector (Collapsible) */}
      {showConnector && (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Connect New Wallet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MultiWalletConnector
              selectedNetwork={selectedNetwork}
              onWalletConnect={handleWalletConnect}
            />
          </CardContent>
        </Card>
      )}

      {/* Smart Contract Interaction */}
      <ContractInteraction />

      {/* Connected Wallets Dashboard */}
      <MultiWalletDashboard />
    </div>
  );
};

export default DecentralizedWallet;
