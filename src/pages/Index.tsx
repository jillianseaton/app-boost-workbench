import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Clock, Wallet, TrendingUp, Users, Star, LogOut, RotateCcw, FileText } from 'lucide-react';
import LoginSignup from '@/components/LoginSignup';
import PrivacyPolicy from '@/components/PrivacyPolicy';
import PartnerAgreement from '@/components/PartnerAgreement';

interface User {
  phoneNumber: string;
  username: string;
}

const EarnFlow = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [earnings, setEarnings] = useState(0);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [hasWithdrawn, setHasWithdrawn] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentAppIndex, setCurrentAppIndex] = useState(0);
  const [showingApp, setShowingApp] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showPartnerAgreement, setShowPartnerAgreement] = useState(false);
  const { toast } = useToast();

  const maxTasks = 20;

  // Third-party app advertisements with prices
  const thirdPartyApps = [
    { name: "StreamMax Pro", product: "Premium Streaming Service", price: 29.99, description: "Unlimited 4K streaming with exclusive content" },
    { name: "FitTracker Elite", product: "Advanced Fitness Tracker", price: 199.99, description: "Monitor your health with precision sensors" },
    { name: "CloudSync Business", product: "Enterprise Cloud Storage", price: 49.99, description: "Secure your data with 1TB cloud storage" },
    { name: "GameVault Premium", product: "Gaming Subscription", price: 19.99, description: "Access to 500+ premium games" },
    { name: "DesignSuite Pro", product: "Creative Design Tools", price: 89.99, description: "Professional design software suite" },
    { name: "LearnHub Academy", product: "Online Course Platform", price: 39.99, description: "Master new skills with expert-led courses" },
    { name: "SecureVPN Ultra", product: "Premium VPN Service", price: 12.99, description: "Anonymous browsing with global servers" },
    { name: "PhotoEdit Master", product: "Photo Editing Software", price: 79.99, description: "Professional photo editing tools" },
    { name: "MusicStream Plus", product: "Music Streaming Service", price: 14.99, description: "High-quality music with offline downloads" },
    { name: "TaskManager Pro", product: "Productivity Suite", price: 24.99, description: "Organize your work and boost productivity" }
  ];

  // Check for existing user session on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('earnflow-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('earnflow-user', JSON.stringify(userData));
    toast({
      title: "Welcome to EarnFlow!",
      description: `Hi ${userData.username}, start earning today!`,
    });
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('earnflow-user');
    // Reset all earnings data
    setEarnings(0);
    setTasksCompleted(0);
    setHasWithdrawn(false);
    setCurrentAppIndex(0);
    setShowingApp(false);
    toast({
      title: "Logged out successfully",
      description: "Your session has been ended securely.",
    });
  };

  const startOptimization = () => {
    if (showingApp || tasksCompleted >= maxTasks) return;
    
    const randomIndex = Math.floor(Math.random() * thirdPartyApps.length);
    setCurrentAppIndex(randomIndex);
    setShowingApp(true);
    
    const app = thirdPartyApps[randomIndex];
    const commission = app.price * 0.05; // 5% commission
    
    setTimeout(() => {
      setEarnings(prev => prev + commission);
      setTasksCompleted(prev => prev + 1);
      setShowingApp(false);
      
      toast({
        title: "Task Completed!",
        description: `Earned $${commission.toFixed(2)} from ${app.name}`,
      });
    }, 3000);
  };

  const resetTasks = () => {
    if (tasksCompleted < maxTasks) {
      toast({
        title: "Cannot reset tasks",
        description: `Complete all ${maxTasks} tasks before resetting.`,
        variant: "destructive",
      });
      return;
    }

    setTasksCompleted(0);
    toast({
      title: "Tasks Reset Successfully",
      description: `You can now complete ${maxTasks} more optimization tasks!`,
    });
  };

  const handleWithdraw = () => {
    if (earnings < 10) {
      toast({
        title: "Minimum withdrawal not met",
        description: "You need at least $10.00 to withdraw.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Withdrawal Initiated",
      description: `$${earnings.toFixed(2)} sent to your Bitcoin wallet!`,
    });
    
    setHasWithdrawn(true);
  };

  const resetAccount = () => {
    setEarnings(0);
    setTasksCompleted(0);
    setHasWithdrawn(false);
    toast({
      title: "Account Reset",
      description: "Ready for a new day of earning!",
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

  const currentApp = thirdPartyApps[currentAppIndex];
  const canStartTask = tasksCompleted < maxTasks && !showingApp && !hasWithdrawn;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-6xl space-y-6">
        {/* Header with logout */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">EarnFlow</h1>
            <p className="text-lg text-muted-foreground">Welcome back, {user.username}!</p>
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

        {/* Current Time */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-xl font-mono">
                {currentTime.toLocaleString('en-US', {
                  timeZone: 'America/New_York',
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })} ET
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Earnings Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Earnings</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${earnings.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasksCompleted}/{maxTasks}</div>
              {tasksCompleted >= maxTasks && (
                <Button 
                  onClick={resetTasks} 
                  size="sm" 
                  variant="outline" 
                  className="mt-2 w-full"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Tasks
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bitcoin Wallet</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground break-all">1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa</div>
            </CardContent>
          </Card>
        </div>

        {/* Third-party App Display */}
        {showingApp && (
          <Card className="border-2 border-primary animate-pulse">
            <CardHeader>
              <CardTitle className="text-center text-xl">{currentApp.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 rounded-lg">
                <h3 className="text-2xl font-bold mb-2">{currentApp.product}</h3>
                <p className="text-lg mb-4">{currentApp.description}</p>
                <div className="text-3xl font-bold">${currentApp.price}</div>
                <div className="text-sm mt-2 opacity-90">You earn: ${(currentApp.price * 0.05).toFixed(2)} (5% commission)</div>
              </div>
              <p className="text-sm text-muted-foreground">Processing your interaction...</p>
            </CardContent>
          </Card>
        )}

        {/* Main Action */}
        <Card>
          <CardContent className="p-8 text-center space-y-6">
            {!hasWithdrawn ? (
              <>
                <Button
                  onClick={startOptimization}
                  disabled={!canStartTask}
                  size="lg"
                  className="w-full md:w-auto px-12 py-6 text-xl"
                >
                  {showingApp ? "Processing..." : 
                   tasksCompleted >= maxTasks ? "Complete 20/20 - Reset to Continue" :
                   `Start Optimization Task (${tasksCompleted}/${maxTasks})`}
                </Button>
                <p className="text-sm text-muted-foreground">
                  {tasksCompleted >= maxTasks ? 
                    "You've completed all daily tasks. Reset to continue earning!" :
                    "Click start to interact with partner advertisements and earn 5% commission"
                  }
                </p>
              </>
            ) : (
              <div className="space-y-4">
                <p className="text-lg text-green-600 font-semibold">✅ Withdrawal completed for today!</p>
                <Button onClick={resetAccount} size="lg" variant="outline">
                  Reset Account for Tomorrow
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Withdrawal Section */}
        {earnings >= 10 && !hasWithdrawn && (
          <Card>
            <CardContent className="p-6 text-center space-y-4">
              <h3 className="text-lg font-semibold">Ready to withdraw?</h3>
              <Button onClick={handleWithdraw} size="lg" variant="default">
                Withdraw ${earnings.toFixed(2)} to Bitcoin Wallet
              </Button>
              <p className="text-sm text-muted-foreground">
                Daily withdrawal required. Account will reset after withdrawal.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Partner Services */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Our Partner Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {thirdPartyApps.slice(0, 6).map((app, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <h4 className="font-semibold">{app.name}</h4>
                  <p className="text-sm text-muted-foreground">{app.product}</p>
                  <p className="text-sm font-bold text-green-600">${app.price}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EarnFlow;
