import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useWeb3 } from '@/hooks/useWeb3';
import { useENS } from '@/hooks/useENS';
import ENSDisplay from '@/components/ENSDisplay';
import { 
  Network, 
  Wallet, 
  ArrowUpDown, 
  RefreshCw, 
  ExternalLink,
  CheckCircle,
  AlertCircle 
} from 'lucide-react';

const EVMIntegration: React.FC = () => {
  const [selectedNetwork, setSelectedNetwork] = useState('ethereum');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [balance, setBalance] = useState<string>('0');
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const { toast } = useToast();
  
  const {
    accounts,
    networkId,
    isConnected,
    isLoading,
    connectWallet,
    getBalance,
    switchNetwork,
  } = useWeb3();

  const { resolveAddress } = useENS();

  const networks = [
    { 
      id: 'ethereum', 
      name: 'Ethereum', 
      symbol: 'ETH', 
      chainId: 1,
      color: 'bg-blue-500',
      explorer: 'https://etherscan.io'
    },
    { 
      id: 'polygon', 
      name: 'Polygon', 
      symbol: 'MATIC', 
      chainId: 137,
      color: 'bg-purple-500',
      explorer: 'https://polygonscan.com'
    },
    { 
      id: 'binance', 
      name: 'BSC', 
      symbol: 'BNB', 
      chainId: 56,
      color: 'bg-yellow-500',
      explorer: 'https://bscscan.com'
    },
    { 
      id: 'avalanche', 
      name: 'Avalanche', 
      symbol: 'AVAX', 
      chainId: 43114,
      color: 'bg-red-500',
      explorer: 'https://snowtrace.io'
    },
    { 
      id: 'arbitrum', 
      name: 'Arbitrum', 
      symbol: 'ETH', 
      chainId: 42161,
      color: 'bg-blue-400',
      explorer: 'https://arbiscan.io'
    },
    { 
      id: 'optimism', 
      name: 'Optimism', 
      symbol: 'ETH', 
      chainId: 10,
      color: 'bg-red-400',
      explorer: 'https://optimistic.etherscan.io'
    },
  ];

  const currentNetwork = networks.find(n => n.chainId === networkId);

  // Fetch balance when account or network changes
  useEffect(() => {
    if (isConnected && accounts.length > 0) {
      fetchBalance();
    }
  }, [isConnected, accounts, networkId]);

  const fetchBalance = async () => {
    if (!accounts.length) return;
    
    setIsLoadingBalance(true);
    try {
      const bal = await getBalance(accounts[0]);
      setBalance(bal);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const handleNetworkSwitch = async (networkName: string) => {
    setSelectedNetwork(networkName);
    await switchNetwork(networkName);
  };

  const handleSendTransaction = async () => {
    if (!recipientAddress || !sendAmount) {
      toast({
        title: "Error",
        description: "Please enter recipient address and amount",
        variant: "destructive",
      });
      return;
    }

    // Resolve ENS if needed
    let finalAddress = recipientAddress;
    if (recipientAddress.endsWith('.eth')) {
      const resolved = await resolveAddress(recipientAddress);
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

    toast({
      title: "Transaction Initiated",
      description: `Sending ${sendAmount} ${currentNetwork?.symbol || 'ETH'} to ${recipientAddress.endsWith('.eth') ? recipientAddress : `${finalAddress.slice(0, 10)}...`}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            EVM Network Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {isConnected ? 'Connected' : 'Not Connected'}
              </span>
              {isConnected ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
            
            {currentNetwork && (
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${currentNetwork.color}`} />
                <span className="text-sm">{currentNetwork.name}</span>
                <Badge variant="secondary">{currentNetwork.symbol}</Badge>
              </div>
            )}
            
            {accounts.length > 0 && (
              <ENSDisplay 
                address={accounts[0]} 
                showAvatar={true}
                className="text-sm text-muted-foreground"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Wallet Connection */}
      {!isConnected && (
        <Card>
          <CardHeader>
            <CardTitle>Connect Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => connectWallet()} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Connecting...' : 'Connect MetaMask/Web3 Wallet'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Network Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Network Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {networks.map((network) => (
              <Button
                key={network.id}
                variant={currentNetwork?.id === network.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleNetworkSwitch(network.id)}
                disabled={!isConnected}
                className="flex items-center gap-2"
              >
                <div className={`w-3 h-3 rounded-full ${network.color}`} />
                {network.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Balance Display */}
      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Wallet Balance
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchBalance}
                disabled={isLoadingBalance}
              >
                <RefreshCw className={`h-4 w-4 ${isLoadingBalance ? 'animate-spin' : ''}`} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoadingBalance ? '...' : `${balance} ${currentNetwork?.symbol || 'ETH'}`}
            </div>
            {currentNetwork && (
              <a
                href={`${currentNetwork.explorer}/address/${accounts[0]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-2"
              >
                View on {currentNetwork.name} Explorer
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </CardContent>
        </Card>
      )}

      {/* Send Transaction */}
      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpDown className="h-5 w-5" />
              Send Transaction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Recipient Address or ENS</label>
              <Input
                placeholder="0x... or alice.eth"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                className="font-mono"
              />
              {recipientAddress && (
                <div className="mt-2">
                  <ENSDisplay 
                    address={recipientAddress} 
                    showAvatar={true}
                    className="text-xs"
                  />
                </div>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium">
                Amount ({currentNetwork?.symbol || 'ETH'})
              </label>
              <Input
                type="number"
                step="0.000001"
                placeholder="0.001"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
              />
            </div>
            
            <Button 
              onClick={handleSendTransaction}
              disabled={!recipientAddress || !sendAmount}
              className="w-full"
            >
              Send Transaction
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EVMIntegration;