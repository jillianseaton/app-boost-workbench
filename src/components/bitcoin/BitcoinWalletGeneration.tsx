import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Bitcoin, Wallet, Copy } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/integrations/supabase/client';

interface WalletData {
  address: string;
  privateKey: string;
  network: string;
}

interface BitcoinWalletGenerationProps {
  wallet: WalletData | null;
  onWalletGenerated: (wallet: WalletData) => void;
}

const BitcoinWalletGeneration: React.FC<BitcoinWalletGenerationProps> = ({
  wallet,
  onWalletGenerated,
}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateWallet = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-wallet');
      
      if (error) throw error;
      
      console.log('Generated wallet:', data);
      onWalletGenerated(data);
      
      toast({
        title: "Bitcoin Wallet Generated!",
        description: "Your new Bitcoin wallet has been created.",
      });
    } catch (error) {
      console.error('Error generating wallet:', error);
      toast({
        title: "Error",
        description: `Failed to generate wallet: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Address copied to clipboard",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bitcoin className="h-5 w-5 text-orange-500" />
          Bitcoin Mainnet Wallet
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Generate a Bitcoin wallet to receive cryptocurrency payouts and manage your Bitcoin earnings directly from your dashboard.
        </p>
        
        {!wallet ? (
          <Button onClick={generateWallet} disabled={loading} className="w-full">
            <Wallet className="h-4 w-4 mr-2" />
            {loading ? "Generating..." : "Generate Bitcoin Wallet"}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Bitcoin Address</label>
                <div className="flex gap-2">
                  <Input 
                    value={wallet.address} 
                    readOnly 
                    className="font-mono text-xs"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(wallet.address)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-center">
                <QRCodeSVG value={wallet.address} size={100} />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BitcoinWalletGeneration;