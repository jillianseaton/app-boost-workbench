
import React from 'react';
import BitcoinWalletSection from './BitcoinWalletSection';
import EVMIntegration from '@/components/EVMIntegration';
import MetaMaskWithdrawal from './MetaMaskWithdrawal';
import CrossChainBridge from './CrossChainBridge';
import WalletPrivateKeyManager from './WalletPrivateKeyManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PayoutSectionProps {
  userId: string;
  earnings: number;
  onWithdraw: (amount: number) => void;
}

const PayoutSection: React.FC<PayoutSectionProps> = ({ userId, earnings, onWithdraw }) => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="metamask" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="keys">Keys</TabsTrigger>
          <TabsTrigger value="bridge">Bridge</TabsTrigger>
          <TabsTrigger value="metamask">MetaMask</TabsTrigger>
          <TabsTrigger value="bitcoin">Bitcoin</TabsTrigger>
          <TabsTrigger value="evm">EVM Networks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="keys" className="space-y-6">
          <WalletPrivateKeyManager />
        </TabsContent>
        
        <TabsContent value="bridge" className="space-y-6">
          <CrossChainBridge />
        </TabsContent>
        
        <TabsContent value="metamask" className="space-y-6">
          <MetaMaskWithdrawal earnings={earnings} onWithdraw={onWithdraw} />
        </TabsContent>
        
        <TabsContent value="bitcoin" className="space-y-6">
          <BitcoinWalletSection />
        </TabsContent>
        
        <TabsContent value="evm" className="space-y-6">
          <EVMIntegration />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PayoutSection;
