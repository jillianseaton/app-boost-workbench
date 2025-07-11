
import React from 'react';
import BitcoinWalletSection from './BitcoinWalletSection';
import EVMIntegration from '@/components/EVMIntegration';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PayoutSectionProps {
  userId: string;
}

const PayoutSection: React.FC<PayoutSectionProps> = ({ userId }) => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="bitcoin" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bitcoin">Bitcoin Wallet</TabsTrigger>
          <TabsTrigger value="evm">EVM Networks</TabsTrigger>
        </TabsList>
        
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
