
import { useState, useEffect } from "react";
import { Clock, DollarSign, TrendingUp, Smartphone, Users, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const Index = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [completedTasks, setCompletedTasks] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [isWorkHours, setIsWorkHours] = useState(false);

  // Mock data for available optimization tasks
  const [tasks] = useState([
    {
      id: 1,
      appName: "FitTracker Pro",
      company: "HealthTech Solutions",
      taskType: "Keyword Optimization",
      reward: 125.50,
      description: "Optimize app store keywords to improve search ranking",
      category: "ASO",
      difficulty: "Medium",
      estimatedTime: "25-35 min"
    },
    {
      id: 2,
      appName: "CookMaster",
      company: "Culinary Apps Inc",
      taskType: "User Engagement Analysis",
      reward: 89.75,
      description: "Analyze user behavior patterns and suggest improvements",
      category: "Analytics",
      difficulty: "Easy",
      estimatedTime: "15-25 min"
    },
    {
      id: 3,
      appName: "StudyBuddy",
      company: "EduTech Global",
      taskType: "Traffic Optimization",
      reward: 156.25,
      description: "Optimize app traffic flow and user acquisition funnel",
      category: "Marketing",
      difficulty: "Hard",
      estimatedTime: "40-50 min"
    },
    {
      id: 4,
      appName: "PhotoEdit Pro",
      company: "Creative Labs",
      taskType: "App Store Optimization",
      reward: 99.00,
      description: "Improve app store listing for better visibility",
      category: "ASO",
      difficulty: "Medium",
      estimatedTime: "30-40 min"
    },
    {
      id: 5,
      appName: "MusicStream",
      company: "Audio Innovations",
      taskType: "Ranking Enhancement",
      reward: 134.80,
      description: "Implement strategies to boost app store rankings",
      category: "Ranking",
      difficulty: "Medium",
      estimatedTime: "35-45 min"
    }
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      // Check if current time is between 11 AM and 11 PM ET
      const hours = now.getHours();
      setIsWorkHours(hours >= 11 && hours < 23);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleStartTask = (task: any) => {
    if (!isWorkHours) {
      toast.error("Workstation is currently closed. Operating hours: 11:00 AM - 11:00 PM ET");
      return;
    }

    const earnings = task.reward * 0.05; // 5% commission
    setCompletedTasks(prev => prev + 1);
    setTotalEarnings(prev => prev + earnings);
    
    toast.success(`Task started! You'll earn $${earnings.toFixed(2)} upon completion.`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-100 text-green-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Hard": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "ASO": return <TrendingUp className="h-4 w-4" />;
      case "Analytics": return <Users className="h-4 w-4" />;
      case "Marketing": return <Smartphone className="h-4 w-4" />;
      case "Ranking": return <CheckCircle className="h-4 w-4" />;
      default: return <TrendingUp className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AppOptimize Pro</h1>
                <p className="text-sm text-gray-600">International App Optimization Platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium">
                  {currentTime.toLocaleTimeString('en-US', { 
                    timeZone: 'America/New_York',
                    hour12: true 
                  })} ET
                </span>
                <Badge variant={isWorkHours ? "default" : "secondary"}>
                  {isWorkHours ? "OPEN" : "CLOSED"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Tasks</CardTitle>
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{20 - completedTasks}/20</div>
              <p className="text-xs text-muted-foreground">
                Optimization tasks ready
              </p>
              <Progress value={(completedTasks / 20) * 100} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
              <p className="text-xs text-muted-foreground">
                Successfully submitted today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${totalEarnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                5% commission per task
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Work Schedule Notice */}
        <Card className="mb-8 border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">Workstation Hours</p>
                <p className="text-sm text-gray-600">
                  Open daily from 11:00 AM to 11:00 PM Eastern Time. All tasks can be completed in under 1 hour.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Tasks */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Available Optimization Tasks</h2>
            <Badge variant="outline" className="text-sm">
              {completedTasks}/{20} Completed Today
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {tasks.map((task) => (
              <Card key={task.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(task.category)}
                      <div>
                        <CardTitle className="text-lg">{task.appName}</CardTitle>
                        <CardDescription>{task.company}</CardDescription>
                      </div>
                    </div>
                    <Badge className={getDifficultyColor(task.difficulty)}>
                      {task.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{task.taskType}</h4>
                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Category: {task.category}</span>
                    <span className="text-gray-600">Time: {task.estimatedTime}</span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <p className="text-sm text-gray-600">App Value: ${task.reward.toFixed(2)}</p>
                      <p className="font-bold text-green-600">Your Earning: ${(task.reward * 0.05).toFixed(2)}</p>
                    </div>
                    <Button 
                      onClick={() => handleStartTask(task)}
                      disabled={!isWorkHours || completedTasks >= 20}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      {completedTasks >= 20 ? "Daily Limit Reached" : "Start Task"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Footer Info */}
        <Card className="mt-8 bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="font-bold text-lg mb-2">How It Works</h3>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Help app developers optimize their applications for better user acquisition and engagement. 
                Complete optimization tasks during business hours and earn 5% commission on each app's value. 
                All tasks are designed to be completed within one hour and contribute to improving app store rankings and user traffic.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
