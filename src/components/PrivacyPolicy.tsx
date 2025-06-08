
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Eye, Database, UserCheck } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-4xl space-y-6">
        <div className="flex items-center gap-4">
          <Button onClick={onBack} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-primary">Privacy Policy</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              EarnFlow Privacy Policy
            </CardTitle>
            <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Information We Collect
              </h3>
              <div className="space-y-3 text-sm">
                <p><strong>Personal Information:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Phone number (for account identification)</li>
                  <li>Username (for platform identification)</li>
                  <li>Bitcoin wallet address (for payment processing)</li>
                </ul>
                
                <p><strong>Usage Data:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Task completion statistics</li>
                  <li>Earnings and withdrawal history</li>
                  <li>Platform interaction metrics</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Third-Party Advertising Partners
              </h3>
              <div className="space-y-3 text-sm">
                <p>
                  EarnFlow partners with third-party advertisers to provide optimization tasks. 
                  Our current advertising partners include but are not limited to:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>StreamMax Pro</li>
                  <li>FitTracker Elite</li>
                  <li>CloudSync Business</li>
                  <li>GameVault Premium</li>
                  <li>DesignSuite Pro</li>
                  <li>LearnHub Academy</li>
                  <li>SecureVPN Ultra</li>
                  <li>PhotoEdit Master</li>
                  <li>MusicStream Plus</li>
                  <li>TaskManager Pro</li>
                </ul>
                
                <p className="bg-yellow-50 p-3 rounded border border-yellow-200">
                  <strong>Important:</strong> When you interact with third-party advertisements during optimization tasks, 
                  these partners may collect additional data according to their own privacy policies. We encourage you to 
                  review each partner's privacy policy before engaging with their content.
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Database className="h-5 w-5" />
                How We Use Your Information
              </h3>
              <div className="space-y-3 text-sm">
                <ul className="list-disc list-inside space-y-1">
                  <li>To provide and maintain the EarnFlow service</li>
                  <li>To process payments and track earnings</li>
                  <li>To communicate with you about your account</li>
                  <li>To improve our platform and user experience</li>
                  <li>To comply with legal obligations</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Data Sharing and Third Parties</h3>
              <div className="space-y-3 text-sm">
                <p>We share limited information with our advertising partners for the following purposes:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Task completion verification</li>
                  <li>Commission calculation and payment processing</li>
                  <li>Fraud prevention and security</li>
                </ul>
                
                <p className="bg-blue-50 p-3 rounded border border-blue-200">
                  <strong>We never sell your personal data.</strong> Information is only shared with partners 
                  as necessary to provide the advertising optimization service and process your earnings.
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Data Security</h3>
              <div className="space-y-3 text-sm">
                <p>We implement appropriate security measures to protect your personal information:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Encrypted data transmission and storage</li>
                  <li>Secure authentication systems</li>
                  <li>Regular security audits and updates</li>
                  <li>Limited access to personal data on a need-to-know basis</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Your Rights</h3>
              <div className="space-y-3 text-sm">
                <p>You have the right to:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate information</li>
                  <li>Delete your account and associated data</li>
                  <li>Withdraw consent for data processing</li>
                  <li>Port your data to another service</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
              <div className="space-y-3 text-sm">
                <p>For privacy-related questions or concerns, please contact us:</p>
                <div className="bg-gray-50 p-3 rounded">
                  <p><strong>Email:</strong> privacy@earnflow.com</p>
                  <p><strong>Phone:</strong> +1 (555) 123-EARN</p>
                  <p><strong>Address:</strong> 123 Privacy Lane, Security City, SC 12345</p>
                </div>
              </div>
            </section>

            <section className="bg-green-50 p-4 rounded border border-green-200">
              <h3 className="text-lg font-semibold mb-3 text-green-800">Our Privacy Commitment</h3>
              <p className="text-sm text-green-700">
                EarnFlow is committed to protecting your privacy. We collect only the minimum information 
                necessary to provide our service and never use your data for unauthorized purposes. 
                Your trust is our top priority.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
