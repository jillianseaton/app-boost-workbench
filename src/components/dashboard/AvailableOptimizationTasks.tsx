import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Globe, 
  Smartphone, 
  ShoppingCart, 
  Users, 
  Gamepad2, 
  Video, 
  BookOpen, 
  Briefcase,
  Play,
  Clock,
  TrendingUp,
  Target
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OptimizationApplication {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: React.ElementType;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedTime: string;
  baseReward: number;
  testTypes: string[];
  isAvailable: boolean;
  completionRate?: number;
}

interface AvailableOptimizationTasksProps {
  onTaskStart: (application: OptimizationApplication) => void;
  isTaskRunning: boolean;
}

const AvailableOptimizationTasks: React.FC<AvailableOptimizationTasksProps> = ({
  onTaskStart,
  isTaskRunning
}) => {
  const { toast } = useToast();
  const [selectedApp, setSelectedApp] = useState<OptimizationApplication | null>(null);

  const applications: OptimizationApplication[] = [
    {
      id: 'ecommerce-platform',
      name: 'E-commerce Platform',
      category: 'Web Application',
      description: 'Test checkout flow, product search, and mobile responsiveness for a major online retailer',
      icon: ShoppingCart,
      difficulty: 'Medium',
      estimatedTime: '8-12 min',
      baseReward: 2.50,
      testTypes: ['Load Testing', 'User Flow', 'Mobile UX', 'Performance Metrics'],
      isAvailable: true,
      completionRate: 87
    },
    {
      id: 'social-media-app',
      name: 'Social Media App',
      category: 'Mobile Application',
      description: 'Optimize feed loading, image compression, and notification delivery performance',
      icon: Users,
      difficulty: 'Hard',
      estimatedTime: '15-20 min',
      baseReward: 4.25,
      testTypes: ['API Response Time', 'Image Optimization', 'Real-time Features', 'Battery Usage'],
      isAvailable: true,
      completionRate: 72
    },
    {
      id: 'gaming-website',
      name: 'Gaming Portal',
      category: 'Web Application',
      description: 'Test game loading times, leaderboard updates, and cross-platform compatibility',
      icon: Gamepad2,
      difficulty: 'Easy',
      estimatedTime: '5-8 min',
      baseReward: 1.75,
      testTypes: ['Loading Speed', 'Real-time Updates', 'Cross-browser Testing'],
      isAvailable: true,
      completionRate: 94
    },
    {
      id: 'video-streaming',
      name: 'Video Streaming Service',
      category: 'Media Platform',
      description: 'Analyze video quality adaptation, buffering optimization, and bandwidth efficiency',
      icon: Video,
      difficulty: 'Hard',
      estimatedTime: '12-18 min',
      baseReward: 3.80,
      testTypes: ['Stream Quality', 'Buffering Analysis', 'CDN Performance', 'Device Compatibility'],
      isAvailable: false,
      completionRate: 68
    },
    {
      id: 'educational-platform',
      name: 'Learning Management System',
      category: 'Educational',
      description: 'Test course video delivery, quiz functionality, and student progress tracking',
      icon: BookOpen,
      difficulty: 'Medium',
      estimatedTime: '10-15 min',
      baseReward: 3.20,
      testTypes: ['Video Delivery', 'Interactive Elements', 'Progress Tracking', 'Accessibility'],
      isAvailable: true,
      completionRate: 89
    },
    {
      id: 'business-dashboard',
      name: 'Business Analytics Dashboard',
      category: 'Enterprise Software',
      description: 'Optimize data visualization loading, real-time chart updates, and export functionality',
      icon: Briefcase,
      difficulty: 'Hard',
      estimatedTime: '18-25 min',
      baseReward: 5.50,
      testTypes: ['Data Visualization', 'Real-time Updates', 'Export Performance', 'Large Dataset Handling'],
      isAvailable: true,
      completionRate: 76
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const handleStartTask = (app: OptimizationApplication) => {
    if (!app.isAvailable) {
      toast({
        title: "Task Unavailable",
        description: "This application is currently not available for testing. Please try another one.",
        variant: "destructive",
      });
      return;
    }

    if (isTaskRunning) {
      toast({
        title: "Task Already Running",
        description: "Please complete your current task before starting a new one.",
        variant: "destructive",
      });
      return;
    }

    setSelectedApp(app);
    onTaskStart(app);
    
    toast({
      title: "Optimization Task Started",
      description: `Beginning performance testing for ${app.name}. Estimated completion: ${app.estimatedTime}`,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-xl">Available Optimization Tasks</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            {applications.filter(app => app.isAvailable).length} Available
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Select an application to run performance optimization tests and earn Bitcoin
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {applications.map((app) => (
            <Card key={app.id} className={`transition-all duration-200 hover:shadow-md ${
              !app.isAvailable ? 'opacity-50' : 'hover:border-blue-200'
            } ${selectedApp?.id === app.id ? 'ring-2 ring-blue-500' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${app.isAvailable ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
                      <app.icon className={`h-5 w-5 ${app.isAvailable ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-sm">{app.name}</h3>
                        <Badge className={`text-xs ${getDifficultyColor(app.difficulty)}`}>
                          {app.difficulty}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{app.category}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{app.description}</p>
                      
                      {/* Test Types */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {app.testTypes.map((test, index) => (
                          <Badge key={index} variant="outline" className="text-xs px-2 py-1">
                            {test}
                          </Badge>
                        ))}
                      </div>

                      {/* Completion Rate */}
                      {app.completionRate && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Success Rate</span>
                            <span className="font-medium">{app.completionRate}%</span>
                          </div>
                          <Progress value={app.completionRate} className="h-1" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{app.estimatedTime}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>${app.baseReward.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    variant={app.isAvailable ? "default" : "outline"}
                    disabled={!app.isAvailable || isTaskRunning}
                    onClick={() => handleStartTask(app)}
                    className="text-xs"
                  >
                    <Play className="h-3 w-3 mr-1" />
                    {app.isAvailable ? 'Start Test' : 'Unavailable'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Running Task Indicator */}
        {selectedApp && isTaskRunning && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Currently Testing: {selectedApp.name}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Performance optimization in progress. Please wait for completion to earn your Bitcoin reward.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AvailableOptimizationTasks;