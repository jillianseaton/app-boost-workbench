
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Code, Book, PlayCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ApiDocumentation: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const { toast } = useToast();

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code Copied",
      description: "Code example copied to clipboard.",
    });
  };

  const codeExamples = {
    javascript: {
      payment: `// Submit a payment
const response = await fetch('/api/partners/payments', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 10000, // Amount in cents ($100.00)
    campaign: 'Summer Sale Campaign',
    description: 'Q1 advertising revenue',
    metadata: {
      partner_id: 'partner_123',
      campaign_type: 'display'
    }
  })
});

const result = await response.json();
console.log(result);`,
      
      analytics: `// Get analytics data
const response = await fetch('/api/partners/analytics', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});

const analytics = await response.json();
console.log(analytics);`
    },
    
    python: {
      payment: `import requests

# Submit a payment
response = requests.post(
    'https://your-domain.com/api/partners/payments',
    headers={
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
    },
    json={
        'amount': 10000,  # Amount in cents ($100.00)
        'campaign': 'Summer Sale Campaign',
        'description': 'Q1 advertising revenue',
        'metadata': {
            'partner_id': 'partner_123',
            'campaign_type': 'display'
        }
    }
)

result = response.json()
print(result)`,
      
      analytics: `import requests

# Get analytics data
response = requests.get(
    'https://your-domain.com/api/partners/analytics',
    headers={
        'Authorization': 'Bearer YOUR_API_KEY'
    }
)

analytics = response.json()
print(analytics)`
    },
    
    php: {
      payment: `<?php
// Submit a payment
$curl = curl_init();

curl_setopt_array($curl, array(
    CURLOPT_URL => 'https://your-domain.com/api/partners/payments',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => array(
        'Authorization: Bearer YOUR_API_KEY',
        'Content-Type: application/json'
    ),
    CURLOPT_POSTFIELDS => json_encode(array(
        'amount' => 10000, // Amount in cents ($100.00)
        'campaign' => 'Summer Sale Campaign',
        'description' => 'Q1 advertising revenue',
        'metadata' => array(
            'partner_id' => 'partner_123',
            'campaign_type' => 'display'
        )
    ))
));

$response = curl_exec($curl);
curl_close($curl);

$result = json_decode($response, true);
print_r($result);
?>`,
      
      analytics: `<?php
// Get analytics data
$curl = curl_init();

curl_setopt_array($curl, array(
    CURLOPT_URL => 'https://your-domain.com/api/partners/analytics',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => array(
        'Authorization: Bearer YOUR_API_KEY'
    )
));

$response = curl_exec($curl);
curl_close($curl);

$analytics = json_decode($response, true);
print_r($analytics);
?>`
    }
  };

  const apiEndpoints = [
    {
      method: 'POST',
      path: '/api/partners/payments',
      description: 'Submit a new payment',
      params: [
        { name: 'amount', type: 'integer', required: true, description: 'Amount in cents' },
        { name: 'campaign', type: 'string', required: true, description: 'Campaign name' },
        { name: 'description', type: 'string', required: false, description: 'Payment description' },
        { name: 'metadata', type: 'object', required: false, description: 'Additional metadata' }
      ]
    },
    {
      method: 'GET',
      path: '/api/partners/payments',
      description: 'List all payments',
      params: [
        { name: 'limit', type: 'integer', required: false, description: 'Number of results (max 100)' },
        { name: 'offset', type: 'integer', required: false, description: 'Pagination offset' },
        { name: 'campaign', type: 'string', required: false, description: 'Filter by campaign' }
      ]
    },
    {
      method: 'GET',
      path: '/api/partners/analytics',
      description: 'Get analytics data',
      params: [
        { name: 'period', type: 'string', required: false, description: 'Time period (7d, 30d, 90d)' },
        { name: 'group_by', type: 'string', required: false, description: 'Group by (day, week, month)' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">API Documentation</h2>
        <p className="text-muted-foreground">
          Complete API reference for integrating with our ad revenue system.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="examples">Code Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Our API allows advertising partners to submit payments, query analytics, and manage their integration programmatically.
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Base URL</h4>
                <code className="text-sm">https://your-domain.com/api/partners</code>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Response Format</h4>
                <p className="text-sm text-muted-foreground">All API responses are in JSON format.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="authentication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Authentication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                All API requests require authentication using your API key in the Authorization header.
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Header Format</h4>
                <code className="text-sm">Authorization: Bearer YOUR_API_KEY</code>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Rate Limiting</h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• 1000 requests per hour per API key</li>
                  <li>• Rate limit headers included in all responses</li>
                  <li>• 429 status code when limit exceeded</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-4">
          {apiEndpoints.map((endpoint, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Badge variant={endpoint.method === 'POST' ? 'default' : 'secondary'}>
                    {endpoint.method}
                  </Badge>
                  <code className="text-sm">{endpoint.path}</code>
                </div>
                <p className="text-sm text-muted-foreground">{endpoint.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h5 className="font-semibold">Parameters</h5>
                  <div className="space-y-2">
                    {endpoint.params.map((param, paramIndex) => (
                      <div key={paramIndex} className="flex items-start gap-3 text-sm">
                        <code className="bg-muted px-2 py-1 rounded text-xs min-w-fit">
                          {param.name}
                        </code>
                        <Badge variant="outline" className="text-xs">
                          {param.type}
                        </Badge>
                        {param.required && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                        <span className="text-muted-foreground">{param.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="examples" className="space-y-4">
          <div className="flex gap-2 mb-4">
            {Object.keys(codeExamples).map((lang) => (
              <Button
                key={lang}
                variant={selectedLanguage === lang ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedLanguage(lang)}
              >
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </Button>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Submit Payment
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyCode(codeExamples[selectedLanguage as keyof typeof codeExamples].payment)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{codeExamples[selectedLanguage as keyof typeof codeExamples].payment}</code>
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Get Analytics
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyCode(codeExamples[selectedLanguage as keyof typeof codeExamples].analytics)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{codeExamples[selectedLanguage as keyof typeof codeExamples].analytics}</code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiDocumentation;
