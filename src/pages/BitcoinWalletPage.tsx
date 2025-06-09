
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BitcoinWallet from '@/components/BitcoinWallet';
import CashAppWallet from '@/components/CashAppWallet';
import WalletManager from '@/components/WalletManager';

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
            <h1 className="text-3xl font-bold text-primary">Bitcoin & Crypto Wallets</h1>
            <p className="text-muted-foreground">Manage your Bitcoin wallets and integrations</p>
          </div>
        </div>

        {/* Wallet Tabs */}
        <Tabs defaultValue="production" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="production">Production Wallets</TabsTrigger>
            <TabsTrigger value="testnet">Testnet Wallet</TabsTrigger>
            <TabsTrigger value="cashapp">CashApp Integration</TabsTrigger>
          </TabsList>
          
          <TabsContent value="production" className="mt-6">
            <WalletManager />
          </TabsContent>
          
          <TabsContent value="testnet" className="mt-6">
            <BitcoinWallet />
          </TabsContent>
          
          <TabsContent value="cashapp" className="mt-6">
            <CashAppWallet />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BitcoinWalletPage;
