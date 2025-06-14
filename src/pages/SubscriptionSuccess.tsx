
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Home, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SubscriptionSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sessionStatus, setSessionStatus] = useState<string>('loading');
  const [sessionData, setSessionData] = useState<any>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      // Verify the session status
      const verifySession = async () => {
        try {
          // Here you would typically call an edge function to verify the session
          // For now, we'll simulate a successful verification
          setSessionStatus('complete');
          setSessionData({
            customer_email: 'user@example.com',
            amount_total: 999,
            currency: 'usd'
          });
          
          toast({
            title: "Subscription Activated!",
            description: "Your subscription has been successfully activated.",
          });
        } catch (error) {
          setSessionStatus('failed');
          toast({
            title: "Verification Failed",
            description: "Unable to verify your subscription. Please contact support.",
            variant: "destructive",
          });
        }
      };

      verifySession();
    } else {
      setSessionStatus('no-session');
    }
  }, [sessionId, toast]);

  if (sessionStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="container mx-auto max-w-2xl space-y-6">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Verifying your subscription...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (sessionStatus === 'failed' || sessionStatus === 'no-session') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="container mx-auto max-w-2xl space-y-6">
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-red-600 mb-4">
                <p className="text-lg font-medium">
                  {sessionStatus === 'no-session' 
                    ? 'No session found' 
                    : 'Subscription verification failed'
                  }
                </p>
                <p className="text-sm">
                  Please contact support if you believe this is an error.
                </p>
              </div>
              <Button onClick={() => navigate('/')}>
                Return Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-2xl space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">Subscription Activated!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-green-800 font-medium mb-2">
                Thank you for subscribing to EarnFlow!
              </p>
              <p className="text-green-700 text-sm">
                Your subscription has been successfully activated and you now have access to all premium features.
              </p>
            </div>

            {sessionData && (
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-medium mb-2">Subscription Details</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Email: {sessionData.customer_email}</p>
                  <p>Amount: ${(sessionData.amount_total / 100).toFixed(2)} {sessionData.currency.toUpperCase()}</p>
                  <p>Status: Active</p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => navigate('/')} size="lg" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Go to Dashboard
              </Button>
              <Button onClick={() => navigate('/profile')} variant="outline" size="lg" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Manage Subscription
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              You can manage your subscription anytime from your account settings.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionSuccess;
