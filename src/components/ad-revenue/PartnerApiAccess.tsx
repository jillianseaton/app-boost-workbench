
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Copy, Key, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
}

interface PartnerApiAccessProps {
  apiKey: string;
  apiEndpoints: ApiEndpoint[];
}

const PartnerApiAccess: React.FC<PartnerApiAccessProps> = ({ apiKey, apiEndpoints }) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const { toast } = useToast();

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    toast({
      title: "API Key Copied",
      description: "Your API key has been copied to clipboard.",
    });
  };

  const copyEndpoint = (endpoint: string) => {
    const fullUrl = `${window.location.origin}/api/partners${endpoint}`;
    navigator.clipboard.writeText(fullUrl);
    toast({
      title: "Endpoint Copied",
      description: "API endpoint copied to clipboard.",
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Credentials
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">API Key</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                value={showApiKey ? apiKey : '••••••••••••••••••••••••••••••••'}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={copyApiKey}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {apiEndpoints.map((endpoint, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{endpoint.method}</Badge>
                  <code className="text-sm">{endpoint.path}</code>
                  <span className="text-sm text-muted-foreground">{endpoint.description}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyEndpoint(endpoint.path)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PartnerApiAccess;
