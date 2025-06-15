
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, CreditCard, Shield, CheckCircle } from 'lucide-react';

const StripeConnectOAuthPage: React.FC = () => {
  const stripeOAuthUrl = "https://connect.stripe.com/oauth/authorize?redirect_uri=https://connect.stripe.com/hosted/oauth&client_id=ca_SUl4mrgUhkYhtYT8RluxfWhlrtxzYZyF&state=onbrd_SVREc6MpeyXyNQ6t3k6iyrESSc&response_type=code&scope=read_write&stripe_user[country]=US";

  const handleConnectAccount = () => {
    window.open(stripeOAuthUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-4xl space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">Connect Your Stripe Account</h1>
          <p className="text-muted-foreground">Securely connect your existing Stripe account or create a new one</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Stripe Connect OAuth
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="space-y-3">
                <h3 className="text-xl font-semibold">Ready to Connect</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Click the button below to securely connect your Stripe account through Stripe's official OAuth flow. 
                  This will allow you to accept payments and manage your account directly through our platform.
                </p>
              </div>

              <Button 
                onClick={handleConnectAccount}
                size="lg"
                className="w-full max-w-sm"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Connect Stripe Account
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="space-y-4">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  Security Features
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Official Stripe OAuth flow
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Secure token-based authentication
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Read/write permissions for full functionality
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Pre-configured for US accounts
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-lg">What Happens Next?</h4>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-3">
                    <Badge variant="outline" className="min-w-fit">1</Badge>
                    <span>You'll be redirected to Stripe's secure connection page</span>
                  </li>
                  <li className="flex gap-3">
                    <Badge variant="outline" className="min-w-fit">2</Badge>
                    <span>Sign in to your existing Stripe account or create a new one</span>
                  </li>
                  <li className="flex gap-3">
                    <Badge variant="outline" className="min-w-fit">3</Badge>
                    <span>Authorize the connection and return to our platform</span>
                  </li>
                  <li className="flex gap-3">
                    <Badge variant="outline" className="min-w-fit">4</Badge>
                    <span>Start accepting payments immediately</span>
                  </li>
                </ol>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This connection uses Stripe's official OAuth protocol, ensuring the highest level of security. 
                Your account credentials are never shared with our platform - only secure access tokens are exchanged.
              </p>
            </div>

            <div className="p-4 bg-muted rounded-md">
              <h5 className="font-semibold text-sm mb-2">Technical Details</h5>
              <div className="space-y-1 text-xs text-muted-foreground font-mono">
                <p><strong>Client ID:</strong> ca_SUl4mrgUhkYhtYT8RluxfWhlrtxzYZyF</p>
                <p><strong>Scope:</strong> read_write</p>
                <p><strong>Country:</strong> US (pre-configured)</p>
                <p><strong>Response Type:</strong> code</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StripeConnectOAuthPage;
