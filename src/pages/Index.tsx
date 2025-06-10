import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { LogOut, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PrivacyPolicy from '@/components/PrivacyPolicy';
import PartnerAgreement from '@/components/PartnerAgreement';
import SubscriptionPurchase from '@/components/SubscriptionPurchase';
import SubscriptionGate from '@/components/SubscriptionGate';
import Dashboard from '@/components/Dashboard';
import { useAuth } from '@/hooks/useAuth';

const EarnFlow = () => {
  const { user, profile, loading, hasActiveSubscription, signOut } = useAuth();
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showPartnerAgreement, setShowPartnerAgreement] = useState(false);
  const [showSubscriptionPurchase, setShowSubscriptionPurchase] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out successfully",
        description: "Your session has been ended securely.",
      });
      // Force navigation to auth page
      window.location.href = '/auth';
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubscriptionSuccess = () => {
    setShowSubscriptionPurchase(false);
    toast({
      title: "Subscription Activated!",
      description: "You now have access to the EarnFlow platform.",
    });
    // Refresh the page to update subscription status
    window.location.reload();
  };

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading EarnFlow...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if no user (will redirect)
  if (!user || !profile) {
    return null;
  }

  if (showPrivacyPolicy) {
    return <PrivacyPolicy onBack={() => setShowPrivacyPolicy(false)} />;
  }

  if (showPartnerAgreement) {
    return <PartnerAgreement onBack={() => setShowPartnerAgreement(false)} />;
  }

  if (showSubscriptionPurchase) {
    return (
      <SubscriptionPurchase 
        user={{ phoneNumber: profile.phone_number || '', username: profile.username || '' }}
        onBack={() => setShowSubscriptionPurchase(false)}
        onSuccess={handleSubscriptionSuccess}
      />
    );
  }

  // Show subscription required screen if no active subscription
  if (!hasActiveSubscription) {
    return (
      <SubscriptionGate 
        user={{ phoneNumber: profile.phone_number || '', username: profile.username || '' }}
        onPurchase={() => setShowSubscriptionPurchase(true)}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-6xl space-y-6">
        {/* Header with logout and subscription status */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">EarnFlow</h1>
            <p className="text-lg text-muted-foreground">Welcome back, {profile.username}!</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-600 font-medium">Operator License Active</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => window.location.href = '/bitcoin-wallet'} variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Bitcoin Wallet
            </Button>
            <Button onClick={() => setShowPrivacyPolicy(true)} variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Privacy Policy
            </Button>
            <Button onClick={() => setShowPartnerAgreement(true)} variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Partner Agreement
            </Button>
            <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Dashboard */}
        <Dashboard user={{ phoneNumber: profile.phone_number || '', username: profile.username || '' }} />
      </div>
    </div>
  );
};

export default EarnFlow;
