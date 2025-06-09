import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import * as bitcoin from 'bitcoinjs-lib';
import * as bip32 from 'bip32';
import * as bip39 from 'bip39';
import ECPairFactory from 'ecpair';
import * as ecc from '@bitcoin-js/tiny-secp256k1-asmjs';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import AppBtc from '@ledgerhq/hw-app-btc';

const ECPair = ECPairFactory(ecc);

export interface WalletInfo {
  address: string;
  publicKey: string;
  derivationPath: string;
  walletType: 'hardware' | 'generated' | 'imported';
  balance?: number;
}

export interface MultisigWallet {
  address: string;
  redeemScript: string;
  publicKeys: string[];
  requiredSignatures: number;
  walletType: 'multisig';
}

export const useWalletManager = () => {
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [multisigWallets, setMultisigWallets] = useState<MultisigWallet[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<WalletInfo | MultisigWallet | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const generateNewWallet = useCallback(async () => {
    try {
      const mnemonic = bip39.generateMnemonic();
      const seed = await bip39.mnemonicToSeed(mnemonic);
      const root = bip32.fromSeed(seed, bitcoin.networks.bitcoin);
      
      // Generate multiple addresses for different purposes
      const derivationPaths = [
        "m/84'/0'/0'/0/0", // Native SegWit (bech32)
        "m/49'/0'/0'/0/0", // SegWit (P2SH)
        "m/44'/0'/0'/0/0"  // Legacy
      ];

      const newWallets: WalletInfo[] = derivationPaths.map((path, index) => {
        const child = root.derivePath(path);
        const { address } = bitcoin.payments.p2wpkh({ 
          pubkey: child.publicKey, 
          network: bitcoin.networks.bitcoin 
        });

        return {
          address: address!,
          publicKey: child.publicKey.toString('hex'),
          derivationPath: path,
          walletType: 'generated' as const
        };
      });

      setWallets(prev => [...prev, ...newWallets]);
      
      toast({
        title: "Wallet Generated",
        description: `Generated ${newWallets.length} Bitcoin addresses. Please backup your mnemonic phrase securely.`,
      });

      // In production, securely store the mnemonic
      console.warn('MNEMONIC (STORE SECURELY):', mnemonic);
      
      return { wallets: newWallets, mnemonic };
    } catch (error) {
      console.error('Error generating wallet:', error);
      toast({
        title: "Wallet Generation Failed",
        description: "Failed to generate new wallet",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  const connectLedgerWallet = useCallback(async () => {
    setIsConnecting(true);
    try {
      const transport = await TransportWebUSB.create();
      const btcApp = new AppBtc({ transport });

      // Get multiple addresses from Ledger
      const derivationPaths = [
        "84'/0'/0'/0/0", // Native SegWit
        "49'/0'/0'/0/0", // SegWit
        "44'/0'/0'/0/0"  // Legacy
      ];

      const ledgerWallets: WalletInfo[] = [];

      for (const path of derivationPaths) {
        const { bitcoinAddress, publicKey } = await btcApp.getWalletPublicKey(
          path,
          { verify: false }
        );

        ledgerWallets.push({
          address: bitcoinAddress,
          publicKey: publicKey,
          derivationPath: path,
          walletType: 'hardware'
        });
      }

      setWallets(prev => [...prev, ...ledgerWallets]);
      await transport.close();

      toast({
        title: "Ledger Connected",
        description: `Connected ${ledgerWallets.length} addresses from Ledger wallet`,
      });

      return ledgerWallets;
    } catch (error) {
      console.error('Error connecting to Ledger:', error);
      toast({
        title: "Ledger Connection Failed",
        description: "Failed to connect to Ledger wallet. Make sure it's connected and Bitcoin app is open.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [toast]);

  const createMultisigWallet = useCallback((publicKeys: string[], requiredSigs: number) => {
    try {
      if (publicKeys.length < 2 || requiredSigs > publicKeys.length) {
        throw new Error('Invalid multisig configuration');
      }

      const pubkeyBuffers = publicKeys.map(pk => Buffer.from(pk, 'hex'));
      const { address, redeem } = bitcoin.payments.p2sh({
        redeem: bitcoin.payments.p2ms({
          m: requiredSigs,
          pubkeys: pubkeyBuffers,
          network: bitcoin.networks.bitcoin
        }),
        network: bitcoin.networks.bitcoin
      });

      const multisigWallet: MultisigWallet = {
        address: address!,
        redeemScript: redeem!.output!.toString('hex'),
        publicKeys,
        requiredSignatures: requiredSigs,
        walletType: 'multisig'
      };

      setMultisigWallets(prev => [...prev, multisigWallet]);

      toast({
        title: "Multisig Wallet Created",
        description: `Created ${requiredSigs}-of-${publicKeys.length} multisig wallet`,
      });

      return multisigWallet;
    } catch (error) {
      console.error('Error creating multisig wallet:', error);
      toast({
        title: "Multisig Creation Failed",
        description: "Failed to create multisig wallet",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  const importWallet = useCallback(async (privateKeyWIF: string) => {
    try {
      const keyPair = ECPair.fromWIF(privateKeyWIF, bitcoin.networks.bitcoin);
      const { address } = bitcoin.payments.p2wpkh({ 
        pubkey: keyPair.publicKey, 
        network: bitcoin.networks.bitcoin 
      });

      const importedWallet: WalletInfo = {
        address: address!,
        publicKey: keyPair.publicKey.toString('hex'),
        derivationPath: 'imported',
        walletType: 'imported'
      };

      setWallets(prev => [...prev, importedWallet]);

      toast({
        title: "Wallet Imported",
        description: "Successfully imported Bitcoin wallet",
      });

      return importedWallet;
    } catch (error) {
      console.error('Error importing wallet:', error);
      toast({
        title: "Import Failed",
        description: "Invalid private key format",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  const selectWallet = useCallback((wallet: WalletInfo | MultisigWallet) => {
    setSelectedWallet(wallet);
    toast({
      title: "Wallet Selected",
      description: `Selected ${wallet.address}`,
    });
  }, [toast]);

  return {
    wallets,
    multisigWallets,
    selectedWallet,
    isConnecting,
    generateNewWallet,
    connectLedgerWallet,
    createMultisigWallet,
    importWallet,
    selectWallet
  };
};
