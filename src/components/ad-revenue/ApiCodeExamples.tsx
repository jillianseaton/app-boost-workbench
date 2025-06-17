
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ApiCodeExamples: React.FC = () => {
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

  return (
    <div className="space-y-4">
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
    </div>
  );
};

export default ApiCodeExamples;
