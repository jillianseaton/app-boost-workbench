import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useENS } from '@/hooks/useENS';
import ENSDisplay from '@/components/ENSDisplay';
import { 
  Network, 
  Wallet, 
  ArrowUpDown, 
  ArrowDownLeft,
  RefreshCw, 
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Copy,
  QrCode,
  Send
} from 'lucide-react';

const MultiEVMIntegration: React.FC = () => {
  const [selectedNetwork, setSelectedNetwork] = useState('ethereum');
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const { toast } = useToast();
  
  const {
    connectedWallets,
    connectWallet,
    updateWalletBalance,
    getWalletsByNetwork,
    isLoading
  } = useMultiWallet();

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

  const currentNetwork = networks.find(n => n.id === selectedNetwork);
  const networkWallets = getWalletsByNetwork(selectedNetwork);
  const activeWallet = connectedWallets.find(w => w.id === selectedWallet);

  const handleNetworkChange = (networkId: string) => {
    setSelectedNetwork(networkId);
    setSelectedWallet(''); // Reset wallet selection when network changes
  };

  const handleQuickConnect = async (provider: string) => {
    const wallet = await connectWallet(provider, selectedNetwork);
    if (wallet) {
      setSelectedWallet(wallet.id);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Address copied to clipboard",
    });
  };

  const handleSendTransaction = async () => {
    if (!recipientAddress || !sendAmount || !activeWallet) {
      toast({
        title: "Error",
        description: "Please select a wallet and enter recipient address and amount",
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
            Multi-Wallet EVM Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {connectedWallets.length} wallet(s) connected
              </span>
            </div>
            
            {currentNetwork && (
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${currentNetwork.color}`} />
                <span className="text-sm">{currentNetwork.name}</span>
                <Badge variant="secondary">{currentNetwork.symbol}</Badge>
              </div>
            )}
            
            {activeWallet && (
              <ENSDisplay 
                address={activeWallet.address} 
                showAvatar={true}
                className="text-sm text-muted-foreground"
              />
            )}
          </div>
        </CardContent>
      </Card>

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
                onClick={() => handleNetworkChange(network.id)}
                className="flex items-center gap-2"
              >
                <div className={`w-3 h-3 rounded-full ${network.color}`} />
                {network.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Wallet Selection for Current Network */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Select Wallet for {currentNetwork?.name}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickConnect('metamask')}
              disabled={isLoading}
            >
              <Wallet className="h-4 w-4 mr-2" />
              Quick Connect MetaMask
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {networkWallets.length > 0 ? (
            <div className="space-y-2">
              <Select value={selectedWallet} onValueChange={setSelectedWallet}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a wallet" />
                </SelectTrigger>
                <SelectContent>
                  {networkWallets.map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">
                          {wallet.address.slice(0, 10)}...{wallet.address.slice(-6)}
                        </span>
                        <Badge variant="secondary">{wallet.balance}</Badge>
                        {wallet.web3Instance && (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No wallets connected to {currentNetwork?.name}</p>
              <p className="text-sm">Connect a wallet to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Balance Display */}
      {activeWallet && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Wallet Balance
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateWalletBalance(activeWallet.id)}
                disabled={!activeWallet.web3Instance}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {activeWallet.balance} {currentNetwork?.symbol || 'ETH'}
            </div>
            {currentNetwork && (
              <a
                href={`${currentNetwork.explorer}/address/${activeWallet.address}`}
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

      {/* Receive Section */}
      {activeWallet && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowDownLeft className="h-5 w-5" />
              Receive {currentNetwork?.symbol || 'ETH'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Your Wallet Address</label>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <ENSDisplay 
                  address={activeWallet.address} 
                  showAvatar={true}
                  showFullAddress={false}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(activeWallet.address)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <QrCode className="h-4 w-4 mt-0.5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-200">
                    How to receive {currentNetwork?.symbol || 'ETH'}:
                  </p>
                  <ul className="mt-1 space-y-1 text-blue-700 dark:text-blue-300">
                    <li>• Share your address above with the sender</li>
                    <li>• Make sure they send to the correct network ({currentNetwork?.name || 'Ethereum'})</li>
                    <li>• Transactions may take a few minutes to confirm</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Send Transaction */}
      {activeWallet && activeWallet.web3Instance && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
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

      {/* Read-Only Warning */}
      {activeWallet && !activeWallet.web3Instance && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                This wallet is in read-only mode. Connect via MetaMask or Web3 provider to send transactions.
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MultiEVMIntegration;