
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MetaMaskWallet from '@/components/MetaMaskWallet';
import KrakenWallet from '@/components/KrakenWallet';

const BitcoinWalletPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-primary">Crypto Wallets</h1>
            <p className="text-muted-foreground">Manage your MetaMask wallet and exchange integrations</p>
          </div>
        </div>

        {/* Wallet Tabs */}
        <Tabs defaultValue="metamask" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="metamask">MetaMask Wallet</TabsTrigger>
            <TabsTrigger value="kraken">Kraken Exchange</TabsTrigger>
          </TabsList>
          
          <TabsContent value="metamask" className="mt-6">
            <MetaMaskWallet />
          </TabsContent>
          
          <TabsContent value="kraken" className="mt-6">
            <KrakenWallet />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BitcoinWalletPage;
