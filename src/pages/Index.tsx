
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { LogOut, FileText } from 'lucide-react';
import LoginSignup from '@/components/LoginSignup';
import PrivacyPolicy from '@/components/PrivacyPolicy';
import PartnerAgreement from '@/components/PartnerAgreement';
import SubscriptionPurchase from '@/components/SubscriptionPurchase';
import SubscriptionGate from '@/components/SubscriptionGate';
import Dashboard from '@/components/Dashboard';

interface User {
  phoneNumber: string;
  username: string;
}

const EarnFlow = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showPartnerAgreement, setShowPartnerAgreement] = useState(false);
  const [showSubscriptionPurchase, setShowSubscriptionPurchase] = useState(false);
  const { toast } = useToast();

  // Check for existing user session on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('earnflow-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      checkSubscriptionStatus(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const checkSubscriptionStatus = async (userData: User) => {
    setSubscriptionLoading(true);
    try {
      // Simulate subscription check - in production this would call your backend
      const storedSubscription = localStorage.getItem(`subscription-${userData.phoneNumber}`);
      if (storedSubscription) {
        const subscription = JSON.parse(storedSubscription);
        const now = new Date();
        const expiryDate = new Date(subscription.expiryDate);
        setHasActiveSubscription(now < expiryDate);
      } else {
        setHasActiveSubscription(false);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setHasActiveSubscription(false);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('earnflow-user', JSON.stringify(userData));
    checkSubscriptionStatus(userData);
    toast({
      title: "Welcome to EarnFlow!",
      description: `Hi ${userData.username}, checking your subscription status...`,
    });
  };

  const handleLogout = () => {
    setUser(null);
    setHasActiveSubscription(false);
    localStorage.removeItem('earnflow-user');
    toast({
      title: "Logged out successfully",
      description: "Your session has been ended securely.",
    });
  };

  const handleSubscriptionSuccess = () => {
    setHasActiveSubscription(true);
    setShowSubscriptionPurchase(false);
    toast({
      title: "Subscription Activated!",
      description: "You now have access to the EarnFlow platform.",
    });
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading EarnFlow...</p>
        </div>
      </div>
    );
  }

  // Show login/signup if no user
  if (!user) {
    return <LoginSignup onLogin={handleLogin} />;
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
        user={user}
        onBack={() => setShowSubscriptionPurchase(false)}
        onSuccess={handleSubscriptionSuccess}
      />
    );
  }

  // Show subscription required screen if no active subscription
  if (!hasActiveSubscription && !subscriptionLoading) {
    return (
      <SubscriptionGate 
        user={user}
        onPurchase={() => setShowSubscriptionPurchase(true)}
        onLogout={handleLogout}
      />
    );
  }

  if (subscriptionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking subscription status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-6xl space-y-6">
        {/* Header with logout and subscription status */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">EarnFlow</h1>
            <p className="text-lg text-muted-foreground">Welcome back, {user.username}!</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-600 font-medium">Operator License Active</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
        <Dashboard user={user} />
      </div>
    </div>
  );
};

export default EarnFlow;
