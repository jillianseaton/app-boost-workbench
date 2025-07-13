import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Bug, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface WalletData {
  address: string;
  privateKey: string;
  network: string;
}

interface BitcoinDebuggerProps {
  wallet: WalletData | null;
}

interface DebugResults {
  walletGeneration: { status: 'success' | 'error' | 'pending'; message: string };
  addressValidation: { status: 'success' | 'error' | 'pending'; message: string };
  utxoCheck: { status: 'success' | 'error' | 'pending'; message: string };
  wifValidation: { status: 'success' | 'error' | 'pending'; message: string };
}

const BitcoinDebugger: React.FC<BitcoinDebuggerProps> = ({ wallet }) => {
  const [results, setResults] = useState<DebugResults | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Debug logging
  console.log('BitcoinDebugger - wallet prop:', wallet);

  const runDiagnostics = async () => {
    setLoading(true);
    const debugResults: DebugResults = {
      walletGeneration: { status: 'pending', message: 'Checking wallet generation...' },
      addressValidation: { status: 'pending', message: 'Validating address format...' },
      utxoCheck: { status: 'pending', message: 'Checking for UTXOs...' },
      wifValidation: { status: 'pending', message: 'Validating WIF format...' }
    };

    setResults({ ...debugResults });

    try {
      // 1. Check wallet generation
      if (!wallet) {
        debugResults.walletGeneration = { 
          status: 'error', 
          message: 'No wallet found. Please generate a wallet first.' 
        };
        setResults({ ...debugResults });
        return;
      }

      debugResults.walletGeneration = { 
        status: 'success', 
        message: `Wallet found: ${wallet.address.substring(0, 20)}...` 
      };
      setResults({ ...debugResults });

      // 2. Validate address format
      const addressRegex = /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/;
      if (addressRegex.test(wallet.address)) {
        debugResults.addressValidation = { 
          status: 'success', 
          message: `Valid Bitcoin mainnet address format` 
        };
      } else {
        debugResults.addressValidation = { 
          status: 'error', 
          message: `Invalid address format: ${wallet.address}` 
        };
      }
      setResults({ ...debugResults });

      // 3. Check UTXOs
      try {
        const utxoResponse = await fetch(`https://mempool.space/api/address/${wallet.address}/utxo`);
        if (utxoResponse.ok) {
          const utxos = await utxoResponse.json();
          if (utxos.length > 0) {
            const totalBalance = utxos.reduce((sum: number, utxo: any) => sum + utxo.value, 0);
            debugResults.utxoCheck = { 
              status: 'success', 
              message: `Found ${utxos.length} UTXOs with ${totalBalance} satoshis total` 
            };
          } else {
            debugResults.utxoCheck = { 
              status: 'error', 
              message: 'No UTXOs found. This wallet has never received Bitcoin or all funds have been spent.' 
            };
          }
        } else {
          debugResults.utxoCheck = { 
            status: 'error', 
            message: 'Failed to fetch UTXOs from mempool.space' 
          };
        }
      } catch (error) {
        debugResults.utxoCheck = { 
          status: 'error', 
          message: `UTXO check failed: ${error.message}` 
        };
      }
      setResults({ ...debugResults });

      // 4. Validate WIF format
      try {
        // Test the WIF with bitcoinjs-lib validation
        const { data: wifTest, error: wifError } = await supabase.functions.invoke('test-wif-validation', {
          body: { privateKeyWIF: wallet.privateKey, address: wallet.address }
        });

        if (wifError) {
          debugResults.wifValidation = { 
            status: 'error', 
            message: `WIF validation failed: ${wifError.message}` 
          };
        } else if (wifTest?.valid) {
          debugResults.wifValidation = { 
            status: 'success', 
            message: `WIF format is valid and generates correct address` 
          };
        } else {
          debugResults.wifValidation = { 
            status: 'error', 
            message: `WIF generates different address than expected` 
          };
        }
      } catch (error) {
        debugResults.wifValidation = { 
          status: 'error', 
          message: `WIF validation error: ${error.message}` 
        };
      }

      setResults({ ...debugResults });

    } catch (error) {
      toast({
        title: "Debug Error",
        description: `Failed to run diagnostics: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: 'success' | 'error' | 'pending') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <div className="h-4 w-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="h-5 w-5" />
          Bitcoin Transaction Debugger
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Diagnose issues with Bitcoin wallet and transaction functionality
          </p>
          <Button onClick={runDiagnostics} disabled={loading} size="sm">
            {loading ? "Running..." : "Run Diagnostics"}
          </Button>
        </div>

        {results && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 border rounded-md">
              {getStatusIcon(results.walletGeneration.status)}
              <div>
                <p className="font-medium">Wallet Generation</p>
                <p className="text-sm text-muted-foreground">{results.walletGeneration.message}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-md">
              {getStatusIcon(results.addressValidation.status)}
              <div>
                <p className="font-medium">Address Validation</p>
                <p className="text-sm text-muted-foreground">{results.addressValidation.message}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-md">
              {getStatusIcon(results.utxoCheck.status)}
              <div>
                <p className="font-medium">UTXO Check</p>
                <p className="text-sm text-muted-foreground">{results.utxoCheck.message}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-md">
              {getStatusIcon(results.wifValidation.status)}
              <div>
                <p className="font-medium">WIF Validation</p>
                <p className="text-sm text-muted-foreground">{results.wifValidation.message}</p>
              </div>
            </div>

            {results.utxoCheck.status === 'error' && (
              <div className="p-3 bg-yellow-50 rounded-md border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <strong>💡 Solution:</strong> To test Bitcoin transactions, you need to send some Bitcoin to this wallet first. 
                  You can use a Bitcoin testnet faucet or send a small amount from another wallet.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BitcoinDebugger;