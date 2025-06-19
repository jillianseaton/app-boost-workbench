
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Loader2, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { stripeExpressLoginService } from '@/services/stripeExpressLoginService';

interface ExpressDashboardAccessProps {
  connectedAccountId?: string;
  onboardingCompleted: boolean;
}

const ExpressDashboardAccess: React.FC<ExpressDashboardAccessProps> = ({
  connectedAccountId,
  onboardingCompleted
}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAccessDashboard = async () => {
    if (!connectedAccountId) {
      toast({
        title: "No Account",
        description: "No connected account found. Please complete onboarding first.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await stripeExpressLoginService.createLoginLink(connectedAccountId);
      
      if (result.url) {
        // Open Express dashboard in new tab
        window.open(result.url, '_blank');
        toast({
          title: "Dashboard Opened",
          description: "Your Stripe Express dashboard has been opened in a new tab.",
        });
      } else {
        throw new Error(result.error || 'Failed to create login link');
      }
    } catch (error) {
      console.error('Dashboard access error:', error);
      toast({
        title: "Access Failed",
        description: error instanceof Error ? error.message : "Failed to access dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!onboardingCompleted || !connectedAccountId) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Express Dashboard Access
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Access your Stripe Express dashboard to manage your account settings, view payouts, and monitor transactions.
        </p>
        
        <Button 
          onClick={handleAccessDashboard}
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating secure link...
            </>
          ) : (
            <>
              <ExternalLink className="h-4 w-4 mr-2" />
              Access Express Dashboard
            </>
          )}
        </Button>
        
        <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Secure Access:</strong> Each dashboard link is unique and expires after use for your security.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpressDashboardAccess;
