
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, Circle, Shield } from 'lucide-react';
import { WalletInfo } from '../DecentralizedWallet';

interface WalletDashboardProps {
  wallets: WalletInfo[];
  onDisconnect: (address: string) => void;
}

const WalletDashboard: React.FC<WalletDashboardProps> = ({
  wallets,
  onDisconnect,
}) => {
  const getNetworkColor = (network: string) => {
    const colors: Record<string, string> = {
      ethereum: 'bg-blue-500',
      bitcoin: 'bg-orange-500',
      polygon: 'bg-purple-500',
      binance: 'bg-yellow-500',
      avalanche: 'bg-red-500',
      solana: 'bg-green-500',
    };
    return colors[network] || 'bg-gray-500';
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Connected Wallets
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wallets.map((wallet, index) => (
            <Card key={`${wallet.address}-${index}`} className="border border-gray-200">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${getNetworkColor(wallet.network)}`} />
                      {wallet.network}
                    </Badge>
                    <Circle className="h-3 w-3 text-green-500 fill-current" />
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-mono text-sm">{formatAddress(wallet.address)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Balance</p>
                    <p className="text-lg font-semibold">{wallet.balance}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        navigator.clipboard.writeText(wallet.address);
                      }}
                    >
                      Copy
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={() => onDisconnect(wallet.address)}
                    >
                      Disconnect
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {wallets.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No wallets connected yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletDashboard;
