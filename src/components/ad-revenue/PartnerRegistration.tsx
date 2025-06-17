
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Building, Mail, Globe, FileText, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PartnerRegistrationProps {
  onRegistrationComplete: (partnerId: string) => void;
}

const PartnerRegistration: React.FC<PartnerRegistrationProps> = ({ onRegistrationComplete }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    contactEmail: '',
    website: '',
    businessType: '',
    description: '',
    monthlyVolume: '',
    integrationMethod: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Submit to API
      console.log('Partner registration:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const partnerId = `partner_${Date.now()}`;
      
      toast({
        title: "Registration Submitted",
        description: "Your partner registration has been submitted for review.",
      });
      
      onRegistrationComplete(partnerId);
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: "Failed to submit registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Partner Registration
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Join our advertising partner network and get API access to our revenue system.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="Your Company Ltd."
                required
              />
            </div>
            <div>
              <Label htmlFor="contactEmail">Contact Email *</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="contact@company.com"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="website">Website URL</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://www.company.com"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="businessType">Business Type *</Label>
              <Select value={formData.businessType} onValueChange={(value) => setFormData({ ...formData, businessType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="advertising-network">Advertising Network</SelectItem>
                  <SelectItem value="affiliate-network">Affiliate Network</SelectItem>
                  <SelectItem value="brand-advertiser">Brand Advertiser</SelectItem>
                  <SelectItem value="media-agency">Media Agency</SelectItem>
                  <SelectItem value="technology-platform">Technology Platform</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="monthlyVolume">Expected Monthly Volume</Label>
              <Select value={formData.monthlyVolume} onValueChange={(value) => setFormData({ ...formData, monthlyVolume: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select volume range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-1k">$0 - $1,000</SelectItem>
                  <SelectItem value="1k-10k">$1,000 - $10,000</SelectItem>
                  <SelectItem value="10k-50k">$10,000 - $50,000</SelectItem>
                  <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
                  <SelectItem value="100k+">$100,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="integrationMethod">Preferred Integration Method</Label>
            <Select value={formData.integrationMethod} onValueChange={(value) => setFormData({ ...formData, integrationMethod: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select integration method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rest-api">REST API</SelectItem>
                <SelectItem value="webhook">Webhook Integration</SelectItem>
                <SelectItem value="manual">Manual Reporting</SelectItem>
                <SelectItem value="custom">Custom Integration</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Business Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tell us about your business and how you plan to use our ad revenue system..."
              rows={4}
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Submitting...' : 'Submit Registration'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PartnerRegistration;
