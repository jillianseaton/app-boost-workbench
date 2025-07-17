
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Home, CreditCard, Calendar, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const SubscriptionSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifySubscription = async () => {
      if (!sessionId || !user) {
        setIsLoading(false);
        return;
      }

      try {
        // Check subscription details
        const { data, error } = await supabase.functions.invoke('check-subscription');
        
        if (error) {
          console.error('Error checking subscription:', error);
        } else if (data) {
          setSubscriptionDetails(data);
        }

        toast({
          title: "Subscription Activated!",
          description: "Welcome to EarnFlow! Your subscription is now active.",
        });

      } catch (error) {
        console.error('Error verifying subscription:', error);
        toast({
          title: "Verification Error",
          description: "There was an issue verifying your subscription. Please contact support if issues persist.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    verifySubscription();
  }, [sessionId, user, toast]);

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Unable to open subscription management. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getSubscriptionName = (plan: string) => {
    switch (plan) {
      case 'basic': return 'Basic Plan';
      case 'standard': return 'Standard Plan';
      case 'professional': return 'Professional Plan';
      case 'enterprise': return 'Enterprise Plan';
      default: return 'Subscription';
    }
  };

  const getSubscriptionPrice = (plan: string) => {
    switch (plan) {
      case 'basic': return '$9.99';
      case 'standard': return '$19.99';
      case 'professional': return '$29.99';
      case 'enterprise': return '$49.99';
      default: return 'N/A';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span>Verifying your subscription...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="container mx-auto max-w-4xl space-y-6">
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">Subscription Activated!</h1>
          <p className="text-xl text-muted-foreground">
            Welcome to EarnFlow! Your subscription is now active and ready to use.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subscription Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Subscription Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscriptionDetails ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Plan:</span>
                    <Badge variant="default">
                      {getSubscriptionName(subscriptionDetails.plan)}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-semibold">
                      {getSubscriptionPrice(subscriptionDetails.plan)}/month
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={subscriptionDetails.status === 'active' ? 'default' : 'secondary'}>
                      {subscriptionDetails.status}
                    </Badge>
                  </div>
                  {subscriptionDetails.expiry_date && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Next billing:</span>
                      <span className="font-medium">
                        {new Date(subscriptionDetails.expiry_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center text-muted-foreground">
                  Subscription details will appear here once verified.
                </div>
              )}

              <div className="pt-4 space-y-2">
                <Button 
                  onClick={handleManageSubscription}
                  variant="outline" 
                  className="w-full"
                >
                  Manage Subscription
                </Button>
                <Button 
                  onClick={() => navigate('/')}
                  className="w-full"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* What's Next */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                What's Next?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Start Earning Commissions</h4>
                    <p className="text-sm text-muted-foreground">
                      Browse available tasks and start earning commissions immediately.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Set Up Payment Methods</h4>
                    <p className="text-sm text-muted-foreground">
                      Configure your Bitcoin wallet or bank account for earnings withdrawal.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Explore Partner Network</h4>
                    <p className="text-sm text-muted-foreground">
                      Connect with affiliate partners and optimize your earning potential.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Track Your Progress</h4>
                    <p className="text-sm text-muted-foreground">
                      Monitor your earnings and performance through detailed analytics.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Support Information */}
        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              If you have any questions about your subscription or need assistance getting started, 
              our support team is here to help.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/contact')}>
                Contact Support
              </Button>
              <Button variant="outline" onClick={() => navigate('/about')}>
                Learn More
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionSuccess;
