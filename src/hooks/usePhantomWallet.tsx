import { useState, useEffect, useCallback } from 'react';
import { PublicKey, Transaction, Connection } from '@solana/web3.js';

interface PhantomProvider {
  isPhantom: boolean;
  publicKey: PublicKey | null;
  isConnected: boolean;
  connect: () => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
  signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array }>;
  on: (event: string, callback: (args: any) => void) => void;
  off: (event: string, callback: (args: any) => void) => void;
}

declare global {
  interface Window {
    phantom?: {
      solana?: PhantomProvider;
    };
  }
}

export interface WalletState {
  connected: boolean;
  connecting: boolean;
  publicKey: string | null;
  balance: number | null;
}

export function usePhantomWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    connecting: false,
    publicKey: null,
    balance: null,
  });

  const [provider, setProvider] = useState<PhantomProvider | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.phantom?.solana?.isPhantom) {
      setProvider(window.phantom.solana);
      
      // Check if already connected
      if (window.phantom.solana.isConnected && window.phantom.solana.publicKey) {
        setWallet({
          connected: true,
          connecting: false,
          publicKey: window.phantom.solana.publicKey.toString(),
          balance: null,
        });
        fetchBalance(window.phantom.solana.publicKey.toString());
      }
    }
  }, []);

  const fetchBalance = useCallback(async (publicKey: string) => {
    try {
      const connection = new Connection('https://api.mainnet-beta.solana.com');
      const balance = await connection.getBalance(new PublicKey(publicKey));
      setWallet(prev => ({ ...prev, balance: balance / 1e9 })); // Convert lamports to SOL
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  }, []);

  const connect = useCallback(async () => {
    if (!provider) {
      window.open('https://phantom.app/', '_blank');
      return;
    }

    try {
      setWallet(prev => ({ ...prev, connecting: true }));
      const response = await provider.connect();
      const publicKey = response.publicKey.toString();
      
      setWallet({
        connected: true,
        connecting: false,
        publicKey,
        balance: null,
      });
      
      await fetchBalance(publicKey);
    } catch (error) {
      console.error('Failed to connect to Phantom:', error);
      setWallet(prev => ({ ...prev, connecting: false }));
    }
  }, [provider, fetchBalance]);

  const disconnect = useCallback(async () => {
    if (!provider) return;
    
    try {
      await provider.disconnect();
      setWallet({
        connected: false,
        connecting: false,
        publicKey: null,
        balance: null,
      });
    } catch (error) {
      console.error('Failed to disconnect from Phantom:', error);
    }
  }, [provider]);

  const signTransaction = useCallback(async (transaction: Transaction) => {
    if (!provider) throw new Error('Phantom not available');
    return await provider.signTransaction(transaction);
  }, [provider]);

  const signMessage = useCallback(async (message: string) => {
    if (!provider) throw new Error('Phantom not available');
    const encodedMessage = new TextEncoder().encode(message);
    return await provider.signMessage(encodedMessage);
  }, [provider]);

  return {
    ...wallet,
    isPhantomInstalled: !!provider,
    connect,
    disconnect,
    signTransaction,
    signMessage,
    refreshBalance: () => wallet.publicKey && fetchBalance(wallet.publicKey),
  };
}
