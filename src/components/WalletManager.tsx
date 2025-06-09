
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWalletManager, WalletInfo, MultisigWallet } from '@/hooks/useWalletManager';
import { Wallet, Shield, Plus, Download, HardDrive, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const WalletManager: React.FC = () => {
  const {
    wallets,
    multisigWallets,
    selectedWallet,
    isConnecting,
    generateNewWallet,
    connectLedgerWallet,
    createMultisigWallet,
    importWallet,
    selectWallet
  } = useWalletManager();

  const [privateKeyInput, setPrivateKeyInput] = useState('');
  const [multisigPubKeys, setMultisigPubKeys] = useState<string[]>(['', '']);
  const [requiredSigs, setRequiredSigs] = useState(2);
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Address copied to clipboard",
    });
  };

  const handleImportWallet = async () => {
    if (!privateKeyInput.trim()) return;
    try {
      await importWallet(privateKeyInput);
      setPrivateKeyInput('');
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleCreateMultisig = () => {
    const validPubKeys = multisigPubKeys.filter(key => key.trim().length > 0);
    if (validPubKeys.length < 2) {
      toast({
        title: "Invalid Configuration",
        description: "At least 2 public keys required for multisig",
        variant: "destructive",
      });
      return;
    }

    try {
      createMultisigWallet(validPubKeys, requiredSigs);
      setMultisigPubKeys(['', '']);
      setRequiredSigs(2);
    } catch (error) {
      // Error handled in hook
    }
  };

  const addMultisigPubKeyField = () => {
    setMultisigPubKeys([...multisigPubKeys, '']);
  };

  const updateMultisigPubKey = (index: number, value: string) => {
    const updated = [...multisigPubKeys];
    updated[index] = value;
    setMultisigPubKeys(updated);
  };

  const WalletCard: React.FC<{ wallet: WalletInfo | MultisigWallet }> = ({ wallet }) => (
    <Card className={`cursor-pointer transition-colors ${
      selectedWallet?.address === wallet.address ? 'ring-2 ring-blue-500' : ''
    }`} onClick={() => selectWallet(wallet)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {wallet.walletType === 'hardware' && <HardDrive className="h-4 w-4 text-blue-500" />}
          {wallet.walletType === 'multisig' && <Shield className="h-4 w-4 text-green-500" />}
          {wallet.walletType === 'generated' && <Wallet className="h-4 w-4 text-orange-500" />}
          {wallet.walletType === 'imported' && <Download className="h-4 w-4 text-purple-500" />}
          <span className="font-medium capitalize">{wallet.walletType}</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono break-all">{wallet.address}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(wallet.address);
              }}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          
          {'derivationPath' in wallet && (
            <p className="text-xs text-muted-foreground">Path: {wallet.derivationPath}</p>
          )}
          
          {'requiredSignatures' in wallet && (
            <p className="text-xs text-muted-foreground">
              {wallet.requiredSignatures}-of-{wallet.publicKeys.length} multisig
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Bitcoin Wallet Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertDescription>
              <strong>⚠️ Production Bitcoin Wallets:</strong> This manages real Bitcoin on mainnet. 
              Always verify addresses and backup your keys securely.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="connect" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="connect">Connect</TabsTrigger>
              <TabsTrigger value="generate">Generate</TabsTrigger>
              <TabsTrigger value="import">Import</TabsTrigger>
              <TabsTrigger value="multisig">Multisig</TabsTrigger>
            </TabsList>

            <TabsContent value="connect" className="space-y-4">
              <div className="space-y-4">
                <Button 
                  onClick={connectLedgerWallet} 
                  disabled={isConnecting}
                  className="w-full"
                >
                  <HardDrive className="h-4 w-4 mr-2" />
                  {isConnecting ? 'Connecting...' : 'Connect Ledger Wallet'}
                </Button>
                
                <Alert>
                  <AlertDescription>
                    Connect your Ledger hardware wallet. Make sure it's connected and the Bitcoin app is open.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>

            <TabsContent value="generate" className="space-y-4">
              <Button onClick={generateNewWallet} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Generate New Wallet
              </Button>
              
              <Alert>
                <AlertDescription>
                  Generates a new HD wallet with multiple address types. 
                  <strong>Save the mnemonic phrase securely!</strong>
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="import" className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Enter private key (WIF format)"
                  value={privateKeyInput}
                  onChange={(e) => setPrivateKeyInput(e.target.value)}
                />
                <Button 
                  onClick={handleImportWallet} 
                  disabled={!privateKeyInput.trim()}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Import Wallet
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="multisig" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Required signatures:</span>
                  <Input
                    type="number"
                    min="1"
                    max={multisigPubKeys.length}
                    value={requiredSigs}
                    onChange={(e) => setRequiredSigs(parseInt(e.target.value) || 1)}
                    className="w-20"
                  />
                  <span className="text-sm">of {multisigPubKeys.length}</span>
                </div>

                {multisigPubKeys.map((pubKey, index) => (
                  <Input
                    key={index}
                    placeholder={`Public key ${index + 1}`}
                    value={pubKey}
                    onChange={(e) => updateMultisigPubKey(index, e.target.value)}
                    className="font-mono text-xs"
                  />
                ))}

                <div className="flex gap-2">
                  <Button onClick={addMultisigPubKeyField} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Key
                  </Button>
                  <Button onClick={handleCreateMultisig} className="flex-1">
                    <Shield className="h-4 w-4 mr-2" />
                    Create Multisig
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Wallet List */}
      {(wallets.length > 0 || multisigWallets.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Your Wallets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {wallets.map((wallet, index) => (
              <WalletCard key={`wallet-${index}`} wallet={wallet} />
            ))}
            {multisigWallets.map((wallet, index) => (
              <WalletCard key={`multisig-${index}`} wallet={wallet} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Selected Wallet */}
      {selectedWallet && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              Selected Wallet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-mono text-sm break-all">{selectedWallet.address}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Type: {selectedWallet.walletType}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WalletManager;
