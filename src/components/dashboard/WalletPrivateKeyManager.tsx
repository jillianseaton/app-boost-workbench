import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Key, Eye, EyeOff, Copy, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const WalletPrivateKeyManager: React.FC = () => {
  const { user } = useAuth();
  const [btcAddress, setBtcAddress] = useState('1LJmPcYx6occVUs4h1ENrkN4L3pS7y7VAh');
  const [privateKey, setPrivateKey] = useState('');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const retrievePrivateKey = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to retrieve your private key.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Call edge function to retrieve private key for the address
      const { data, error } = await supabase.functions.invoke('get-wallet-private-key', {
        body: {
          address: btcAddress,
          userId: user.id,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to retrieve private key');
      }

      if (!data.privateKey) {
        throw new Error('Private key not found for this address');
      }

      setPrivateKey(data.privateKey);
      
      toast({
        title: "Private Key Retrieved",
        description: "Your Bitcoin wallet private key has been retrieved successfully.",
      });
      
    } catch (error: any) {
      console.error('Private key retrieval error:', error);
      toast({
        title: "Retrieval Failed",
        description: error.message || "Could not retrieve private key. The address may not be associated with your account.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Private key copied to clipboard",
    });
  };

  const generateNewWallet = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-wallet');
      
      if (error) throw error;
      
      setBtcAddress(data.address);
      setPrivateKey(data.privateKey);
      
      toast({
        title: "New Wallet Generated!",
        description: "Your new Bitcoin wallet has been created with full access.",
      });
    } catch (error: any) {
      console.error('Error generating wallet:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate new wallet.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Bitcoin Wallet Manager
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            This tool helps you retrieve the private key for Bitcoin addresses generated in this app, 
            or create a new wallet with full access.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="btc-address">Bitcoin Address</Label>
          <Input
            id="btc-address"
            value={btcAddress}
            onChange={(e) => setBtcAddress(e.target.value)}
            placeholder="Enter your Bitcoin address"
            className="font-mono text-sm"
          />
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={retrievePrivateKey}
            disabled={isLoading || !btcAddress}
            variant="outline"
            className="flex-1"
          >
            {isLoading ? "Retrieving..." : "Retrieve Private Key"}
          </Button>
          
          <Button 
            onClick={generateNewWallet}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? "Generating..." : "Generate New Wallet"}
          </Button>
        </div>

        {privateKey && (
          <div className="space-y-2">
            <Label htmlFor="private-key">Private Key (WIF Format)</Label>
            <div className="flex gap-2">
              <Input
                id="private-key"
                type={showPrivateKey ? "text" : "password"}
                value={privateKey}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPrivateKey(!showPrivateKey)}
              >
                {showPrivateKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(privateKey)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Alert>
              <AlertDescription className="text-amber-600">
                ⚠️ Keep this private key secure! Anyone with access to it can control your Bitcoin.
              </AlertDescription>
            </Alert>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• If the address was generated in this app, you can retrieve its private key</p>
          <p>• Use "Generate New Wallet" to create a fresh wallet with full access</p>
          <p>• Never share your private key with anyone</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletPrivateKeyManager;