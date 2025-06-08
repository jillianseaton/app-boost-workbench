
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Handshake, DollarSign, Shield, FileCheck } from 'lucide-react';

interface PartnerAgreementProps {
  onBack: () => void;
}

const PartnerAgreement: React.FC<PartnerAgreementProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-4xl space-y-6">
        <div className="flex items-center gap-4">
          <Button onClick={onBack} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-primary">Partner Agreement</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Handshake className="h-5 w-5 text-primary" />
              Third-Party Advertising Partner Agreement
            </CardTitle>
            <p className="text-sm text-muted-foreground">Effective Date: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <section className="bg-blue-50 p-4 rounded border border-blue-200">
              <h3 className="text-lg font-semibold mb-3 text-blue-800">Notice to Third-Party Advertisers</h3>
              <p className="text-sm text-blue-700">
                This agreement outlines the terms under which EarnFlow uses third-party advertisements 
                in our optimization task platform. By working with EarnFlow, advertising partners 
                agree to these terms and conditions.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                Partnership Overview
              </h3>
              <div className="space-y-3 text-sm">
                <p>
                  EarnFlow operates as an advertising optimization platform that connects users with 
                  third-party advertising content. Our platform facilitates user engagement with 
                  partner advertisements through structured optimization tasks.
                </p>
                
                <p><strong>Current Advertising Partners:</strong></p>
                <div className="grid grid-cols-2 gap-2 ml-4">
                  <ul className="list-disc list-inside space-y-1">
                    <li>StreamMax Pro</li>
                    <li>FitTracker Elite</li>
                    <li>CloudSync Business</li>
                    <li>GameVault Premium</li>
                    <li>DesignSuite Pro</li>
                  </ul>
                  <ul className="list-disc list-inside space-y-1">
                    <li>LearnHub Academy</li>
                    <li>SecureVPN Ultra</li>
                    <li>PhotoEdit Master</li>
                    <li>MusicStream Plus</li>
                    <li>TaskManager Pro</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Revenue Sharing Model
              </h3>
              <div className="space-y-3 text-sm">
                <p><strong>Commission Structure:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>EarnFlow users earn 5% commission on each advertisement interaction</li>
                  <li>Commission is calculated based on the advertised product price</li>
                  <li>Payments are processed daily to user Bitcoin wallets</li>
                  <li>EarnFlow retains operational fees to maintain platform infrastructure</li>
                </ul>
                
                <div className="bg-green-50 p-3 rounded border border-green-200">
                  <p className="text-green-700">
                    <strong>Example:</strong> If a partner advertises a $100 product, the user earns $5.00 
                    commission for completing the optimization task interaction.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Advertising Partner Obligations</h3>
              <div className="space-y-3 text-sm">
                <p><strong>Content Requirements:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Provide accurate product information and pricing</li>
                  <li>Ensure all advertising content complies with applicable laws</li>
                  <li>Maintain current and truthful product descriptions</li>
                  <li>Honor any promotions or offers presented through the platform</li>
                </ul>
                
                <p><strong>Data and Privacy:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Maintain individual privacy policies for any data collection</li>
                  <li>Comply with applicable data protection regulations (GDPR, CCPA, etc.)</li>
                  <li>Provide clear opt-out mechanisms for users</li>
                  <li>Respect user privacy preferences and consent choices</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Data Collection and Usage
              </h3>
              <div className="space-y-3 text-sm">
                <p><strong>Information Shared with Partners:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Aggregated interaction metrics (no personal identifiers)</li>
                  <li>Task completion statistics</li>
                  <li>General demographic information (when available and consented)</li>
                  <li>Performance analytics for optimization purposes</li>
                </ul>
                
                <p><strong>Information NOT Shared:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>User phone numbers or contact information</li>
                  <li>Bitcoin wallet addresses</li>
                  <li>Individual user identification data</li>
                  <li>Personal financial information</li>
                </ul>
                
                <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                  <p className="text-yellow-700">
                    <strong>Important:</strong> Partners may collect additional data directly from users 
                    during advertisement interactions. Such collection is governed by the partner's 
                    own privacy policy, not EarnFlow's.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Platform Integration Terms</h3>
              <div className="space-y-3 text-sm">
                <p><strong>Advertisement Display:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Ads are displayed randomly during optimization tasks</li>
                  <li>Each interaction lasts approximately 3 seconds</li>
                  <li>Users are clearly informed about the advertising nature of content</li>
                  <li>No guarantee of specific impression volumes or timing</li>
                </ul>
                
                <p><strong>Performance Metrics:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Monthly reports on interaction volumes</li>
                  <li>User engagement analytics</li>
                  <li>Commission payment summaries</li>
                  <li>Platform performance statistics</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Compliance and Legal</h3>
              <div className="space-y-3 text-sm">
                <p><strong>Regulatory Compliance:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>All advertising content must comply with FTC guidelines</li>
                  <li>Clear disclosure of advertising relationships</li>
                  <li>Compliance with applicable state and federal advertising laws</li>
                  <li>Adherence to platform-specific advertising policies</li>
                </ul>
                
                <p><strong>Prohibited Content:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Illegal products or services</li>
                  <li>Misleading or deceptive advertising</li>
                  <li>Adult content or gambling promotions</li>
                  <li>Content that violates intellectual property rights</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Agreement Termination</h3>
              <div className="space-y-3 text-sm">
                <p>This agreement may be terminated by either party with 30 days written notice. Upon termination:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>All outstanding commissions will be paid within 60 days</li>
                  <li>Partner content will be removed from the platform</li>
                  <li>Data sharing arrangements will cease immediately</li>
                  <li>Both parties will delete shared confidential information</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
              <div className="space-y-3 text-sm">
                <p>For partnership inquiries or agreement questions:</p>
                <div className="bg-gray-50 p-3 rounded">
                  <p><strong>Business Development:</strong> partners@earnflow.com</p>
                  <p><strong>Legal Department:</strong> legal@earnflow.com</p>
                  <p><strong>Technical Support:</strong> tech@earnflow.com</p>
                  <p><strong>Phone:</strong> +1 (555) 123-EARN</p>
                </div>
              </div>
            </section>

            <section className="bg-green-50 p-4 rounded border border-green-200">
              <h3 className="text-lg font-semibold mb-3 text-green-800">Partnership Commitment</h3>
              <p className="text-sm text-green-700">
                EarnFlow is committed to transparent, ethical advertising partnerships that benefit 
                all parties while protecting user privacy and maintaining compliance with all 
                applicable regulations. We value long-term relationships built on trust and mutual success.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PartnerAgreement;
