import React from 'react';
import { Button } from '@/components/ui/button';
import { Wallet, Loader2 } from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';

const MetaMaskConnector: React.FC = () => {
  const { connectWallet, isConnected, isLoading, accounts } = useWeb3();

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect MetaMask:', error);
    }
  };

  if (isConnected && accounts.length > 0) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <div className="flex items-center gap-1 text-green-600">
          <Wallet className="h-4 w-4" />
          <span>Connected</span>
        </div>
        <span className="text-muted-foreground">
          {accounts[0].slice(0, 6)}...{accounts[0].slice(-4)}
        </span>
      </div>
    );
  }

  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={handleConnect}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Wallet className="h-4 w-4 mr-2" />
      )}
      {isLoading ? 'Connecting...' : 'Connect MetaMask'}
    </Button>
  );
};

export default MetaMaskConnector;