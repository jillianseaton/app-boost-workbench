
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Shield,
  ExternalLink,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface KrakenAccount {
  connected: boolean;
  balances: { [currency: string]: string };
  tradeFee: number;
  verification: 'unverified' | 'intermediate' | 'pro';
}

interface KrakenConnectionFormProps {
  account: KrakenAccount | null;
  loading: boolean;
  connectionError: string;
  onConnect: (apiKey: string, apiSecret: string) => Promise<void>;
  onRefreshBalances: () => Promise<void>;
}

const KrakenConnectionForm: React.FC<KrakenConnectionFormProps> = ({
  account,
  loading,
  connectionError,
  onConnect,
  onRefreshBalances
}) => {
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [showSecrets, setShowSecrets] = useState(false);
  const [localConnectionError, setLocalConnectionError] = useState<string>('');

  const validateApiCredentials = () => {
    if (!apiKey.trim() || !apiSecret.trim()) {
      setLocalConnectionError('Both API key and secret are required');
      return false;
    }

    if (apiKey.length < 50) {
      setLocalConnectionError('API key appears too short. Please check your Kraken API key.');
      return false;
    }

    if (apiSecret.length < 80) {
      setLocalConnectionError('API secret appears too short. Please check your Kraken API secret.');
      return false;
    }

    if (apiKey.includes(' ') || apiSecret.includes(' ')) {
      setLocalConnectionError('API credentials should not contain spaces. Please check for copy/paste errors.');
      return false;
    }

    setLocalConnectionError('');
    return true;
  };

  const handleConnect = async () => {
    if (!validateApiCredentials()) {
      return;
    }
    await onConnect(apiKey.trim(), apiSecret.trim());
  };

  const displayedError = connectionError || localConnectionError;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Kraken Exchange Integration
          {account?.connected && <CheckCircle className="h-5 w-5 text-green-500" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Real Kraken Integration:</strong> This connects to your actual Kraken account for live trading and withdrawals.
            Never share your API credentials with anyone.
          </AlertDescription>
        </Alert>

        {!account ? (
          <div className="space-y-4">
            {displayedError && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{displayedError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label>Kraken API Key</Label>
              <div className="relative">
                <Input 
                  type={showSecrets ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setLocalConnectionError('');
                  }}
                  placeholder="Enter your Kraken API key (starts with letters/numbers)"
                  className="pr-10"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowSecrets(!showSecrets)}
                >
                  {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Should be ~56 characters long
              </p>
            </div>

            <div className="space-y-2">
              <Label>Kraken API Secret</Label>
              <Input 
                type={showSecrets ? "text" : "password"}
                value={apiSecret}
                onChange={(e) => {
                  setApiSecret(e.target.value);
                  setLocalConnectionError('');
                }}
                placeholder="Enter your Kraken API secret (long base64 string)"
              />
              <p className="text-xs text-muted-foreground">
                Should be ~88 characters long
              </p>
            </div>

            <Alert>
              <AlertDescription>
                Generate API credentials at: 
                <a href="https://www.kraken.com/u/security/api" target="_blank" rel="noopener noreferrer" className="ml-1 text-blue-600 hover:underline">
                  Kraken API Settings <ExternalLink className="h-3 w-3 inline" />
                </a>
                <br />
                <strong>Required permissions:</strong> Query Funds, Withdraw Funds, Trade
                <br />
                <strong>Note:</strong> API keys may take a few minutes to become active after creation.
              </AlertDescription>
            </Alert>
            
            <Button 
              onClick={handleConnect} 
              disabled={loading || !apiKey || !apiSecret} 
              className="w-full"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Connecting to Kraken...
                </>
              ) : (
                "Connect Kraken Account"
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-green-500">Connected</Badge>
                <Badge variant="secondary">Verification: {account.verification}</Badge>
                <Badge variant="outline">Fee: {account.tradeFee}%</Badge>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRefreshBalances} 
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KrakenConnectionForm;
