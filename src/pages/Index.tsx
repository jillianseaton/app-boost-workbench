import { useState, useEffect } from "react";
import { Clock, DollarSign, TrendingUp, Smartphone, Users, CheckCircle, Bitcoin, Award, Star, Shield, Gift, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const Index = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [completedTasks, setCompletedTasks] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [creditScore, setCreditScore] = useState(100);
  const [vipLevel, setVipLevel] = useState(1);
  const [bitcoinAddress, setBitcoinAddress] = useState("bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh");
  const [isWorkHours, setIsWorkHours] = useState(false);
  const [canWithdraw, setCanWithdraw] = useState(false);
  const [hasWithdrawnToday, setHasWithdrawnToday] = useState(false);

  // VIP levels configuration
  const vipLevels = [
    { level: 1, name: "VIP1", commission: 0.5, tasksPerGroup: 40, groupsPerDay: 2, color: "from-blue-400 to-blue-600" },
    { level: 2, name: "VIP2", commission: 0.8, tasksPerGroup: 50, groupsPerDay: 3, color: "from-purple-400 to-purple-600" },
    { level: 3, name: "VIP3", commission: 1.2, tasksPerGroup: 60, groupsPerDay: 4, color: "from-gold-400 to-gold-600" },
    { level: 4, name: "VIP4", commission: 1.5, tasksPerGroup: 80, groupsPerDay: 5, color: "from-emerald-400 to-emerald-600" },
  ];

  const currentVIP = vipLevels.find(v => v.level === vipLevel) || vipLevels[0];
  const MINIMUM_WITHDRAWAL_USD = 10;
  const BTC_TO_USD_RATE = 45000; // Simulated BTC rate

  // Partnership services
  const partnershipServices = [
    { name: "Premium Ads Network", type: "Advertisement", commission: "15%" },
    { name: "AppStore Boost", type: "Ranking", commission: "12%" },
    { name: "Social Media Push", type: "Marketing", commission: "10%" },
    { name: "Influencer Connect", type: "Promotion", commission: "18%" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      const hours = now.getHours();
      setIsWorkHours(hours >= 11 && hours < 23);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const earningsInUSD = totalEarnings * BTC_TO_USD_RATE;
    setCanWithdraw(earningsInUSD >= MINIMUM_WITHDRAWAL_USD);
  }, [totalEarnings]);

  const handleStartOptimization = () => {
    if (!isWorkHours) {
      toast.error("Workstation is currently closed. Operating hours: 11:00 AM - 11:00 PM ET");
      return;
    }

    if (hasWithdrawnToday) {
      toast.error("Please complete withdrawal and reset your account to continue optimizing for the next day");
      return;
    }

    // Base task value of $10 minimum with VIP commission
    const baseTaskValueUSD = 10;
    const commissionMultiplier = 1 + (currentVIP.commission / 100);
    const taskEarningsUSD = baseTaskValueUSD * (currentVIP.commission / 100);
    const taskEarningsBTC = taskEarningsUSD / BTC_TO_USD_RATE;
    
    setCompletedTasks(prev => prev + 1);
    setTotalEarnings(prev => prev + taskEarningsBTC);
    
    toast.success(`Optimization task completed! Earned ${taskEarningsUSD.toFixed(2)} USD (${taskEarningsBTC.toFixed(6)} BTC)`);
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
                <Badge variant={isWorkHours ? "default" : "secondary"} className="bg-purple-600">
                  {isWorkHours ? "ONLINE" : "OFFLINE"}
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

        {/* Optimization Requirements Alert */}
        <Card className="bg-orange-500/10 border-orange-500/20 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Star className="h-6 w-6 text-orange-400" />
              <div>
                <h3 className="text-white font-bold">Optimization Requirements</h3>
                <p className="text-orange-200 text-sm">
                  • Minimum optimization task value: $10 USD • Complete daily withdrawal required • Reset account daily for next day tasks
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Navigation Grid */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-lg border-purple-500/20 hover:bg-white/20 transition-all cursor-pointer" onClick={handleStartOptimization}>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="bg-blue-500/20 p-4 rounded-full mb-3">
                <TrendingUp className="h-8 w-8 text-blue-400" />
              </div>
              <span className="text-white font-medium">Start Optimizing</span>
            </CardContent>
          </Card>

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
                {currentVIP.groupsPerDay} groups every day, each group has {currentVIP.tasksPerGroup}/{currentVIP.tasksPerGroup} orders, and the commission is {currentVIP.commission}%
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
              <div className="text-2xl font-bold text-white">{completedTasks}/20</div>
              <p className="text-xs text-purple-200">Daily optimization tasks</p>
              <Progress value={(completedTasks / 20) * 100} className="mt-2" />
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
              <CardTitle className="text-sm font-medium text-white">Account Status</CardTitle>
              <RefreshCw className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">
                {hasWithdrawnToday ? "Reset Required" : "Active"}
              </div>
              <p className="text-xs text-purple-200">Daily cycle</p>
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

        {/* Start Optimization Button */}
        <div className="text-center">
          <Button 
            onClick={handleStartOptimization}
            disabled={!isWorkHours || hasWithdrawnToday}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-8 py-4"
          >
            {hasWithdrawnToday ? "Reset Account to Continue" : 
             !isWorkHours ? "Workstation Closed" : 
             "Start Optimization Rating Task"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
