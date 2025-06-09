
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useMetaMaskWallet } from '@/hooks/useMetaMaskWallet';
import { Wallet, Copy, ExternalLink, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MetaMaskWallet: React.FC = () => {
  const {
    wallet,
    isConnecting,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    isMetaMaskInstalled
  } = useMetaMaskWallet();
  
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Address copied to clipboard",
    });
  };

  const getNetworkName = (chainId: string) => {
    const networks: { [key: string]: string } = {
      '0x1': 'Ethereum Mainnet',
      '0x3': 'Ropsten Testnet',
      '0x4': 'Rinkeby Testnet',
      '0x5': 'Goerli Testnet',
      '0x89': 'Polygon Mainnet',
      '0x38': 'BSC Mainnet'
    };
    return networks[chainId] || `Chain ${chainId}`;
  };

  const openInEtherscan = () => {
    if (!wallet) return;
    const baseUrl = wallet.chainId === '0x1' 
      ? 'https://etherscan.io' 
      : 'https://goerli.etherscan.io';
    window.open(`${baseUrl}/address/${wallet.address}`, '_blank');
  };

  if (!isMetaMaskInstalled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            MetaMask Wallet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              MetaMask is not installed. Please install the MetaMask browser extension to use this wallet.
            </AlertDescription>
          </Alert>
          <Button 
            className="w-full mt-4" 
            onClick={() => window.open('https://metamask.io/', '_blank')}
          >
            Install MetaMask
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            MetaMask Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!wallet ? (
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  Connect your MetaMask wallet to manage your Ethereum assets.
                </AlertDescription>
              </Alert>
              <Button 
                onClick={connectWallet} 
                disabled={isConnecting}
                className="w-full"
              >
                {isConnecting ? "Connecting..." : "Connect MetaMask"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Connected Account</span>
                  <Badge variant="secondary">
                    {getNetworkName(wallet.chainId)}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-sm break-all">
                    {wallet.address}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(wallet.address)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={openInEtherscan}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="text-lg font-bold">
                  {wallet.balance} ETH
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => switchNetwork('0x1')}
                  disabled={wallet.chainId === '0x1'}
                >
                  Mainnet
                </Button>
                <Button
                  variant="outline"
                  onClick={() => switchNetwork('0x5')}
                  disabled={wallet.chainId === '0x5'}
                >
                  Goerli
                </Button>
                <Button
                  variant="outline"
                  onClick={connectWallet}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button
                  variant="destructive"
                  onClick={disconnectWallet}
                >
                  Disconnect
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MetaMaskWallet;
