
import { useState, useEffect } from "react";
import { Clock, DollarSign, TrendingUp, Smartphone, Users, CheckCircle, Bitcoin, Award, Star, Shield, Gift, RefreshCw, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

const Index = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [completedTasks, setCompletedTasks] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [creditScore, setCreditScore] = useState(100);
  const [vipLevel, setVipLevel] = useState(1);
  const [bitcoinAddress, setBitcoinAddress] = useState("bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh");
  const [canWithdraw, setCanWithdraw] = useState(false);
  const [hasWithdrawnToday, setHasWithdrawnToday] = useState(false);
  const [showAdDialog, setShowAdDialog] = useState(false);
  const [currentAd, setCurrentAd] = useState(null);

  // VIP levels configuration
  const vipLevels = [
    { level: 1, name: "VIP1", commission: 0.5, tasksPerDay: 20, color: "from-blue-400 to-blue-600" },
    { level: 2, name: "VIP2", commission: 0.8, tasksPerDay: 30, color: "from-purple-400 to-purple-600" },
    { level: 3, name: "VIP3", commission: 1.2, tasksPerDay: 40, color: "from-gold-400 to-gold-600" },
    { level: 4, name: "VIP4", commission: 1.5, tasksPerDay: 50, color: "from-emerald-400 to-emerald-600" },
  ];

  // Third-party app advertisements
  const thirdPartyAds = [
    { 
      name: "GameMaster Pro", 
      category: "Gaming App", 
      price: 299, 
      description: "Premium mobile gaming experience with exclusive content",
      company: "GameTech Studios"
    },
    { 
      name: "FitTracker Elite", 
      category: "Health & Fitness", 
      price: 199, 
      description: "Advanced fitness tracking with AI-powered insights",
      company: "HealthTech Solutions"
    },
    { 
      name: "PhotoEdit Master", 
      category: "Photography", 
      price: 149, 
      description: "Professional photo editing tools for mobile devices",
      company: "Creative Apps Inc"
    },
    { 
      name: "MusicStream Plus", 
      category: "Entertainment", 
      price: 99, 
      description: "High-quality music streaming with offline capabilities",
      company: "Audio Innovations"
    },
    { 
      name: "StudyBoost AI", 
      category: "Education", 
      price: 249, 
      description: "AI-powered learning assistant for academic success",
      company: "EduTech Pro"
    },
    { 
      name: "CryptoWallet Secure", 
      category: "Finance", 
      price: 179, 
      description: "Advanced cryptocurrency wallet with multi-layer security",
      company: "BlockChain Solutions"
    }
  ];

  const currentVIP = vipLevels.find(v => v.level === vipLevel) || vipLevels[0];
  const MINIMUM_WITHDRAWAL_USD = 10;
  const BTC_TO_USD_RATE = 45000; // Simulated BTC rate
  const COMMISSION_RATE = 0.05; // 5% commission

  // Partnership services
  const partnershipServices = [
    { name: "Premium Ads Network", type: "Advertisement", commission: "15%" },
    { name: "AppStore Boost", type: "Ranking", commission: "12%" },
    { name: "Social Media Push", type: "Marketing", commission: "10%" },
    { name: "Influencer Connect", type: "Promotion", commission: "18%" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const earningsInUSD = totalEarnings * BTC_TO_USD_RATE;
    setCanWithdraw(earningsInUSD >= MINIMUM_WITHDRAWAL_USD);
  }, [totalEarnings]);

  const handleStartOptimization = () => {
    if (hasWithdrawnToday) {
      toast.error("Please complete withdrawal and reset your account to continue optimizing for the next day");
      return;
    }

    if (completedTasks >= currentVIP.tasksPerDay) {
      toast.error(`Daily task limit reached for ${currentVIP.name}. Maximum ${currentVIP.tasksPerDay} tasks per day.`);
      return;
    }

    // Select a random third-party app advertisement
    const randomAd = thirdPartyAds[Math.floor(Math.random() * thirdPartyAds.length)];
    setCurrentAd(randomAd);
    setShowAdDialog(true);
  };

  const handleAdInteraction = () => {
    if (!currentAd) return;

    // Calculate 5% commission from the ad price
    const commissionUSD = currentAd.price * COMMISSION_RATE;
    const commissionBTC = commissionUSD / BTC_TO_USD_RATE;
    
    setCompletedTasks(prev => prev + 1);
    setTotalEarnings(prev => prev + commissionBTC);
    setShowAdDialog(false);
    
    toast.success(`Task completed! Earned $${commissionUSD.toFixed(2)} USD (${commissionBTC.toFixed(6)} BTC) from ${currentAd.name} advertisement`);
  };

  const handleWithdraw = () => {
    if (totalEarnings === 0) {
      toast.error("No earnings to withdraw");
      return;
    }

    const earningsInUSD = totalEarnings * BTC_TO_USD_RATE;
    
    if (earningsInUSD < MINIMUM_WITHDRAWAL_USD) {
      toast.error(`Minimum withdrawal amount is $${MINIMUM_WITHDRAWAL_USD} USD. Current earnings: $${earningsInUSD.toFixed(2)} USD`);
      return;
    }
    
    toast.success(`Withdrawal request submitted! ${totalEarnings.toFixed(6)} BTC ($${earningsInUSD.toFixed(2)} USD) will be sent to ${bitcoinAddress}`);
    setHasWithdrawnToday(true);
    toast.info("Daily withdrawal completed. Please reset your account to continue optimizing tomorrow.");
  };

  const handleResetAccount = () => {
    if (!hasWithdrawnToday) {
      toast.error("You must withdraw your daily earnings before resetting your account");
      return;
    }

    setTotalEarnings(0);
    setCompletedTasks(0);
    setHasWithdrawnToday(false);
    setCanWithdraw(false);
    
    toast.success("Account reset successfully! You can now start optimizing tasks for the next day.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Rakuten</h1>
                <p className="text-sm text-purple-200">tf.rakutenxx.org</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-white">
                <Clock className="h-5 w-5 text-purple-400" />
                <span className="text-sm font-medium">
                  {currentTime.toLocaleTimeString('en-US', { 
                    timeZone: 'America/New_York',
                    hour12: true 
                  })} ET
                </span>
                <Badge className="bg-green-600 text-white">
                  24/7 ONLINE
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">Hi! Welcome</h2>
          <div className="flex items-center justify-center space-x-4">
            <span className="text-white">Rakuten</span>
            <Shield className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">Credit score: {creditScore}</span>
          </div>
        </div>

        {/* Optimization Info Alert */}
        <Card className="bg-blue-500/10 border-blue-500/20 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Star className="h-6 w-6 text-blue-400" />
              <div>
                <h3 className="text-white font-bold">Third-Party App Optimization</h3>
                <p className="text-blue-200 text-sm">
                  • Earn 5% commission from each third-party app advertisement • Complete daily withdrawal required • Reset account daily for next day tasks • Platform operates 24/7
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Start Optimization Button - Featured */}
        <div className="text-center mb-8">
          <Button 
            onClick={handleStartOptimization}
            disabled={hasWithdrawnToday || completedTasks >= currentVIP.tasksPerDay}
            size="lg"
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-xl px-12 py-6"
          >
            <Play className="h-6 w-6 mr-3" />
            {hasWithdrawnToday ? "Reset Account to Continue" : 
             completedTasks >= currentVIP.tasksPerDay ? "Daily Limit Reached" :
             "Start Optimization Task"}
          </Button>
          <p className="text-purple-200 text-sm mt-2">
            Click to interact with third-party app advertisements and earn 5% commission
          </p>
        </div>

        {/* Main Navigation Grid */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-lg border-purple-500/20 hover:bg-white/20 transition-all cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="bg-purple-500/20 p-4 rounded-full mb-3">
                <Award className="h-8 w-8 text-purple-400" />
              </div>
              <span className="text-white font-medium">Cert</span>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-purple-500/20 hover:bg-white/20 transition-all cursor-pointer" onClick={handleWithdraw}>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="bg-green-500/20 p-4 rounded-full mb-3">
                <Bitcoin className="h-8 w-8 text-green-400" />
              </div>
              <span className="text-white font-medium">Withdraw</span>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-purple-500/20 hover:bg-white/20 transition-all cursor-pointer" onClick={handleResetAccount}>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="bg-orange-500/20 p-4 rounded-full mb-3">
                <RefreshCw className="h-8 w-8 text-orange-400" />
              </div>
              <span className="text-white font-medium">Reset Account</span>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-purple-500/20 hover:bg-white/20 transition-all cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="bg-blue-500/20 p-4 rounded-full mb-3">
                <DollarSign className="h-8 w-8 text-blue-400" />
              </div>
              <span className="text-white font-medium">TERMS</span>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-purple-500/20 hover:bg-white/20 transition-all cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="bg-yellow-500/20 p-4 rounded-full mb-3">
                <Star className="h-8 w-8 text-yellow-400" />
              </div>
              <span className="text-white font-medium">EVENTS</span>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-purple-500/20 hover:bg-white/20 transition-all cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="bg-red-500/20 p-4 rounded-full mb-3">
                <CheckCircle className="h-8 w-8 text-red-400" />
              </div>
              <span className="text-white font-medium">FAQ</span>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-purple-500/20 hover:bg-white/20 transition-all cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="bg-indigo-500/20 p-4 rounded-full mb-3">
                <Smartphone className="h-8 w-8 text-indigo-400" />
              </div>
              <span className="text-white font-medium">About Us</span>
            </CardContent>
          </Card>
        </div>

        {/* VIP Level Section */}
        <Card className="bg-white/10 backdrop-blur-lg border-purple-500/20 mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white text-xl">VIP Level</CardTitle>
            <Button variant="ghost" className="text-blue-400 hover:text-blue-300">
              View More →
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 mb-6">
              {vipLevels.map((level) => (
                <div key={level.level} className={`relative ${level.level === vipLevel ? 'ring-2 ring-blue-400' : ''}`}>
                  <div className={`bg-gradient-to-br ${level.color} p-4 rounded-lg flex flex-col items-center`}>
                    <Shield className="h-12 w-12 text-white mb-2" />
                    {level.level === vipLevel && (
                      <div className="absolute -top-2 -right-2 bg-blue-500 rounded-full p-1">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-black/20 rounded-lg p-4">
              <h3 className="text-white font-bold text-lg mb-2">{currentVIP.name}</h3>
              <p className="text-gray-300 text-sm">
                Up to {currentVIP.tasksPerDay} optimization tasks per day, earn 5% commission from third-party app advertisements
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-lg border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Completed Tasks</CardTitle>
              <Smartphone className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{completedTasks}/{currentVIP.tasksPerDay}</div>
              <p className="text-xs text-purple-200">Third-party app interactions</p>
              <Progress value={(completedTasks / currentVIP.tasksPerDay) * 100} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Bitcoin Earnings</CardTitle>
              <Bitcoin className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-400">{totalEarnings.toFixed(6)} BTC</div>
              <p className="text-xs text-purple-200">${(totalEarnings * BTC_TO_USD_RATE).toFixed(2)} USD</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Withdrawal Status</CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {canWithdraw ? "Ready" : "Pending"}
              </div>
              <p className="text-xs text-purple-200">Min: $10 USD</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Platform Status</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">24/7 Online</div>
              <p className="text-xs text-purple-200">Always available</p>
            </CardContent>
          </Card>
        </div>

        {/* Partnership Services */}
        <Card className="bg-white/10 backdrop-blur-lg border-purple-500/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Third-Party Partnership Services</CardTitle>
            <CardDescription className="text-purple-200">
              Our certified partners provide comprehensive app promotion and monetization services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {partnershipServices.map((service, index) => (
                <div key={index} className="bg-black/20 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">{service.name}</h4>
                    <p className="text-purple-200 text-sm">{service.type}</p>
                  </div>
                  <Badge className="bg-green-600 text-white">{service.commission}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bitcoin Wallet Section */}
        <Card className="bg-white/10 backdrop-blur-lg border-purple-500/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Bitcoin className="h-5 w-5 text-orange-400" />
              <span>Bitcoin Wallet Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-white text-sm font-medium">Wallet Address</label>
                <div className="mt-1 p-3 bg-black/20 rounded-lg text-orange-400 font-mono text-sm break-all">
                  {bitcoinAddress}
                </div>
              </div>
              <div className="flex space-x-4">
                <Button 
                  onClick={handleWithdraw}
                  disabled={!canWithdraw}
                  className="bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700"
                >
                  <Bitcoin className="h-4 w-4 mr-2" />
                  Withdraw BTC {!canWithdraw && `(Min $${MINIMUM_WITHDRAWAL_USD})`}
                </Button>
                <Button 
                  onClick={handleResetAccount}
                  disabled={!hasWithdrawnToday}
                  variant="outline" 
                  className="border-blue-500 text-blue-300 hover:bg-blue-600"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset Account
                </Button>
                <Button variant="outline" className="border-purple-500 text-purple-300 hover:bg-purple-600">
                  Update Wallet
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Third-Party App Advertisement Dialog */}
      <Dialog open={showAdDialog} onOpenChange={setShowAdDialog}>
        <DialogContent className="bg-gradient-to-br from-slate-900 to-purple-900 border-purple-500/20">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">
              Third-Party App Advertisement
            </DialogTitle>
            <DialogDescription className="text-purple-200">
              Interact with this advertisement to earn 5% commission
            </DialogDescription>
          </DialogHeader>
          
          {currentAd && (
            <div className="space-y-4">
              <div className="bg-black/20 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-white">{currentAd.name}</h3>
                  <Badge className="bg-blue-600 text-white">{currentAd.category}</Badge>
                </div>
                
                <p className="text-purple-200 mb-4">{currentAd.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-300">by {currentAd.company}</span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400">${currentAd.price}</div>
                    <div className="text-sm text-purple-200">Ad Value</div>
                  </div>
                </div>
                
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-green-400 font-medium">Your Commission (5%)</span>
                    <span className="text-green-400 text-xl font-bold">
                      ${(currentAd.price * COMMISSION_RATE).toFixed(2)} USD
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  onClick={handleAdInteraction}
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Task & Earn Commission
                </Button>
                <Button 
                  onClick={() => setShowAdDialog(false)}
                  variant="outline" 
                  className="border-gray-500 text-gray-300 hover:bg-gray-600"
                >
                  Skip
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
