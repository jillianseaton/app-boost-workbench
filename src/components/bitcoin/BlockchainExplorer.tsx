import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Search, Bitcoin, Globe } from 'lucide-react';

interface BlockchainExplorerProps {
  address?: string;
}

const BlockchainExplorer: React.FC<BlockchainExplorerProps> = ({ 
  address = 'bc1qynefm4c3rwcwwclep6095dnjgatr9faz4rj0tn' 
}) => {
  const openBlockExplorer = (service: string) => {
    let url = '';
    switch (service) {
      case 'blockstream':
        url = `https://blockstream.info/address/${address}`;
        break;
      case 'blockchain':
        url = `https://www.blockchain.com/btc/address/${address}`;
        break;
      case 'blockchair':
        url = `https://blockchair.com/bitcoin/address/${address}`;
        break;
      default:
        url = `https://blockstream.info/address/${address}`;
    }
    window.open(url, '_blank');
  };

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-600" />
          Check Real Bitcoin Blockchain
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Bitcoin className="h-4 w-4 text-blue-600" />
            <span className="font-semibold text-blue-800">Your Bitcoin Address:</span>
          </div>
          <div className="font-mono text-sm break-all text-blue-700 bg-white p-2 rounded border">
            {address}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Check real Bitcoin transactions on the blockchain using these block explorers:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Button
              variant="outline"
              onClick={() => openBlockExplorer('blockstream')}
              className="flex items-center justify-center gap-2"
            >
              <Search className="h-4 w-4" />
              Blockstream.info
              <ExternalLink className="h-3 w-3" />
            </Button>
            
            <Button
              variant="outline"
              onClick={() => openBlockExplorer('blockchain')}
              className="flex items-center justify-center gap-2"
            >
              <Search className="h-4 w-4" />
              Blockchain.com
              <ExternalLink className="h-3 w-3" />
            </Button>
            
            <Button
              variant="outline"
              onClick={() => openBlockExplorer('blockchair')}
              className="flex items-center justify-center gap-2"
            >
              <Search className="h-4 w-4" />
              Blockchair.com
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            <strong>What you'll see:</strong> Real Bitcoin transactions sent to your address will appear 
            on these blockchain explorers. The "converted" transactions in the app are simulated - 
            for actual Bitcoin delivery, you'd need real payments from your Coinbase Commerce integration.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-gray-50 rounded">
            <div className="font-semibold text-gray-700">Real Transactions</div>
            <div className="text-gray-600">Shown on blockchain explorers</div>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <div className="font-semibold text-gray-700">App Transactions</div>
            <div className="text-gray-600">Simulated conversions in database</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlockchainExplorer;