import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, ExternalLink, RefreshCw, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface WalletCardProps {
  connected: boolean;
  connecting: boolean;
  publicKey: string | null;
  balance: number | null;
  isPhantomInstalled: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onRefreshBalance: () => void;
}

export function WalletCard({
  connected,
  connecting,
  publicKey,
  balance,
  isPhantomInstalled,
  onConnect,
  onDisconnect,
  onRefreshBalance,
}: WalletCardProps) {
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey);
      setCopied(true);
      toast.success('Address copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Phantom Wallet
          </CardTitle>
          {connected && (
            <Badge variant="secondary" className="bg-green-500/20 text-green-400">
              Connected
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isPhantomInstalled ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-3">
              Phantom wallet not detected
            </p>
            <Button
              variant="outline"
              onClick={() => window.open('https://phantom.app/', '_blank')}
            >
              Install Phantom
              <ExternalLink className="ml-2 w-4 h-4" />
            </Button>
          </div>
        ) : connected ? (
          <>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Address</span>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                    {truncateAddress(publicKey!)}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={copyAddress}
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Balance</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">
                    {balance !== null ? `${balance.toFixed(4)} SOL` : '—'}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={onRefreshBalance}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={onDisconnect}
            >
              Disconnect
            </Button>
          </>
        ) : (
          <Button
            className="w-full"
            onClick={onConnect}
            disabled={connecting}
          >
            {connecting ? 'Connecting...' : 'Connect Wallet'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
