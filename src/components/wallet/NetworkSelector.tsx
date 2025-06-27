
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface NetworkSelectorProps {
  selectedNetwork: string;
  onNetworkChange: (network: string) => void;
}

const networks = [
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', color: 'bg-blue-500' },
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', color: 'bg-orange-500' },
  { id: 'polygon', name: 'Polygon', symbol: 'MATIC', color: 'bg-purple-500' },
  { id: 'binance', name: 'Binance Smart Chain', symbol: 'BNB', color: 'bg-yellow-500' },
  { id: 'avalanche', name: 'Avalanche', symbol: 'AVAX', color: 'bg-red-500' },
  { id: 'solana', name: 'Solana', symbol: 'SOL', color: 'bg-green-500' },
];

const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  selectedNetwork,
  onNetworkChange,
}) => {
  const selectedNetworkInfo = networks.find(n => n.id === selectedNetwork);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select value={selectedNetwork} onValueChange={onNetworkChange}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select network" />
          </SelectTrigger>
          <SelectContent>
            {networks.map((network) => (
              <SelectItem key={network.id} value={network.id}>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${network.color}`} />
                  {network.name} ({network.symbol})
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedNetworkInfo && (
          <Badge variant="secondary" className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${selectedNetworkInfo.color}`} />
            {selectedNetworkInfo.name}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {networks.map((network) => (
          <button
            key={network.id}
            onClick={() => onNetworkChange(network.id)}
            className={`p-3 rounded-lg border-2 transition-all ${
              selectedNetwork === network.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className={`w-4 h-4 rounded-full ${network.color} mx-auto mb-1`} />
            <p className="text-xs font-medium">{network.symbol}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default NetworkSelector;
