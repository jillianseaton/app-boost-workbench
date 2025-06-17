
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Building, DollarSign, Code } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PartnerManagementProps {
  connectAccountId: string;
}

const PartnerManagement: React.FC<PartnerManagementProps> = ({ connectAccountId }) => {
  const [showAddPartner, setShowAddPartner] = useState(false);
  const [newPartnerName, setNewPartnerName] = useState('');
  const [newPartnerEmail, setNewPartnerEmail] = useState('');
  const { toast } = useToast();

  // TODO: Fetch real partners from API
  const partners = [
    {
      id: '1',
      name: 'Google AdSense',
      email: 'partner@google.com',
      totalRevenue: 8450.75,
      status: 'active',
      apiKey: 'pk_partner_google_...',
    },
    {
      id: '2',
      name: 'Facebook Audience Network',
      email: 'partner@facebook.com',
      totalRevenue: 3240.50,
      status: 'active',
      apiKey: 'pk_partner_facebook_...',
    },
  ];

  const handleAddPartner = () => {
    if (!newPartnerName || !newPartnerEmail) {
      toast({
        title: "Missing Information",
        description: "Please provide both partner name and email.",
        variant: "destructive",
      });
      return;
    }

    // TODO: Add partner via API
    toast({
      title: "Partner Added",
      description: `${newPartnerName} has been added as an advertising partner.`,
    });
    
    setNewPartnerName('');
    setNewPartnerEmail('');
    setShowAddPartner(false);
  };

  const copyApiEndpoint = () => {
    const endpoint = `${window.location.origin}/api/ad-revenue/payment`;
    navigator.clipboard.writeText(endpoint);
    toast({
      title: "Copied!",
      description: "API endpoint copied to clipboard.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Advertising Partners
            </CardTitle>
            <Button onClick={() => setShowAddPartner(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Partner
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {partners.map((partner) => (
              <div key={partner.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Building className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{partner.name}</p>
                    <p className="text-sm text-muted-foreground">{partner.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <DollarSign className="h-3 w-3" />
                      <span className="text-xs text-muted-foreground">
                        Total: ${partner.totalRevenue.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <Badge variant={partner.status === 'active' ? 'default' : 'secondary'}>
                    {partner.status}
                  </Badge>
                  <div>
                    <code className="text-xs bg-muted px-2 py-1 rounded">{partner.apiKey}</code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {showAddPartner && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Partner</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="partnerName">Partner Name</Label>
              <Input
                id="partnerName"
                placeholder="e.g., Google AdSense"
                value={newPartnerName}
                onChange={(e) => setNewPartnerName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="partnerEmail">Contact Email</Label>
              <Input
                id="partnerEmail"
                type="email"
                placeholder="partner@company.com"
                value={newPartnerEmail}
                onChange={(e) => setNewPartnerEmail(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddPartner}>Add Partner</Button>
              <Button variant="outline" onClick={() => setShowAddPartner(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            API Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Payment API Endpoint</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={`${window.location.origin}/api/ad-revenue/payment`}
                readOnly
                className="font-mono text-sm"
              />
              <Button variant="outline" size="sm" onClick={copyApiEndpoint}>
                Copy
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Partners can send POST requests to this endpoint to submit payments.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PartnerManagement;
