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
  algorithms: string[];
  realWorldImpact: string;
  technicalMetrics: string[];
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
      description: 'Advanced ML algorithms analyze user journey patterns, cart abandonment rates, and conversion optimization',
      icon: ShoppingCart,
      difficulty: 'Medium',
      estimatedTime: '8-12 min',
      baseReward: 2.50,
      testTypes: ['Neural Network Analysis', 'Behavioral Pattern Recognition', 'A/B Testing Optimization'],
      algorithms: ['Deep Learning UX Analysis', 'Predictive Load Balancing', 'Real-time Conversion Optimization'],
      realWorldImpact: 'Reduces cart abandonment by 23% and improves checkout completion rates for 2.3M daily users',
      technicalMetrics: ['Core Web Vitals', 'Time to Interactive', 'Conversion Funnel Analysis', 'User Engagement Heatmaps'],
      isAvailable: true,
      completionRate: 87
    },
    {
      id: 'social-media-app',
      name: 'Social Media App',
      category: 'Mobile Application',
      description: 'AI-powered algorithms optimize content delivery, engagement patterns, and real-time interaction performance',
      icon: Users,
      difficulty: 'Hard',
      estimatedTime: '15-20 min',
      baseReward: 4.25,
      testTypes: ['Machine Learning Feed Optimization', 'Real-time Performance Analysis', 'Edge Computing Efficiency'],
      algorithms: ['Content Recommendation Engine', 'Dynamic Resource Allocation', 'Predictive Caching Algorithms'],
      realWorldImpact: 'Improves feed loading speed by 45% and increases user engagement for 15M+ active users worldwide',
      technicalMetrics: ['API Response Time', 'Memory Optimization', 'Network Efficiency', 'Battery Usage Analysis'],
      isAvailable: true,
      completionRate: 72
    },
    {
      id: 'gaming-website',
      name: 'Gaming Portal',
      category: 'Web Application',
      description: 'Advanced rendering algorithms test game asset loading, real-time multiplayer performance, and latency optimization',
      icon: Gamepad2,
      difficulty: 'Easy',
      estimatedTime: '5-8 min',
      baseReward: 1.75,
      testTypes: ['Asset Pipeline Optimization', 'Latency Reduction Algorithms', 'Concurrent User Load Testing'],
      algorithms: ['Dynamic Asset Compression', 'Predictive Pre-loading', 'WebGL Performance Optimization'],
      realWorldImpact: 'Reduces game loading times by 60% and supports 500K+ concurrent players with optimized performance',
      technicalMetrics: ['Frame Rate Stability', 'Asset Loading Speed', 'Network Latency', 'Memory Usage'],
      isAvailable: true,
      completionRate: 94
    },
    {
      id: 'video-streaming',
      name: 'Video Streaming Service',
      category: 'Media Platform',
      description: 'Sophisticated adaptive bitrate algorithms analyze network conditions and optimize video delivery quality',
      icon: Video,
      difficulty: 'Hard',
      estimatedTime: '12-18 min',
      baseReward: 3.80,
      testTypes: ['Adaptive Bitrate Optimization', 'CDN Performance Analysis', 'Quality Prediction Algorithms'],
      algorithms: ['Machine Learning Quality Adaptation', 'Predictive Buffering', 'Multi-CDN Load Balancing'],
      realWorldImpact: 'Reduces buffering events by 78% and improves video quality satisfaction for 50M+ viewers globally',
      technicalMetrics: ['Bitrate Adaptation', 'Buffer Health', 'Quality Metrics', 'Startup Time'],
      isAvailable: false,
      completionRate: 68
    },
    {
      id: 'educational-platform',
      name: 'Learning Management System',
      category: 'Educational',
      description: 'AI-driven learning analytics optimize content delivery pathways and personalized educational experiences',
      icon: BookOpen,
      difficulty: 'Medium',
      estimatedTime: '10-15 min',
      baseReward: 3.20,
      testTypes: ['Learning Path Optimization', 'Adaptive Content Delivery', 'Performance Analytics'],
      algorithms: ['Personalized Learning Algorithms', 'Content Recommendation Engine', 'Progress Prediction Models'],
      realWorldImpact: 'Improves learning outcomes by 35% and course completion rates for 8M+ students worldwide',
      technicalMetrics: ['Content Load Speed', 'Interactive Response Time', 'Accessibility Compliance', 'Engagement Tracking'],
      isAvailable: true,
      completionRate: 89
    },
    {
      id: 'business-dashboard',
      name: 'Business Analytics Dashboard',
      category: 'Enterprise Software',
      description: 'Advanced data processing algorithms optimize large-scale visualization rendering and real-time analytics performance',
      icon: Briefcase,
      difficulty: 'Hard',
      estimatedTime: '18-25 min',
      baseReward: 5.50,
      testTypes: ['Big Data Processing', 'Real-time Visualization Optimization', 'Enterprise Scale Testing'],
      algorithms: ['Distributed Query Optimization', 'Real-time Data Aggregation', 'Visualization Rendering Engine'],
      realWorldImpact: 'Processes 10TB+ of daily data 3x faster, enabling real-time decisions for 100K+ business users',
      technicalMetrics: ['Query Performance', 'Data Visualization Speed', 'Memory Efficiency', 'Concurrent User Handling'],
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
          Advanced algorithms simulate real-world application testing scenarios. Complete tasks to help improve 
          performance and user experience of applications serving millions of users worldwide.
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
                      
                      {/* Advanced Algorithms */}
                      <div className="mb-3">
                        <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">Advanced Algorithms:</p>
                        <div className="flex flex-wrap gap-1">
                          {app.algorithms.map((algorithm, index) => (
                            <Badge key={index} variant="outline" className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/30 border-blue-200">
                              {algorithm}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Real-World Impact */}
                      <div className="mb-3 p-2 bg-green-50 dark:bg-green-900/20 rounded border-l-2 border-green-400">
                        <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">Real-World Impact:</p>
                        <p className="text-xs text-green-600 dark:text-green-400">{app.realWorldImpact}</p>
                      </div>
                      
                      {/* Technical Metrics */}
                      <div className="mb-3">
                        <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">Technical Metrics Analyzed:</p>
                        <div className="flex flex-wrap gap-1">
                          {app.technicalMetrics.map((metric, index) => (
                            <Badge key={index} variant="outline" className="text-xs px-2 py-1 bg-purple-50 dark:bg-purple-900/30 border-purple-200">
                              {metric}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Test Types */}
                      <div className="mb-3">
                        <p className="text-xs font-medium text-orange-700 dark:text-orange-300 mb-1">Optimization Tests:</p>
                        <div className="flex flex-wrap gap-1">
                          {app.testTypes.map((test, index) => (
                            <Badge key={index} variant="outline" className="text-xs px-2 py-1 bg-orange-50 dark:bg-orange-900/30 border-orange-200">
                              {test}
                            </Badge>
                          ))}
                        </div>
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
              <span className="text-sm font-medium">Advanced Algorithms Processing: {selectedApp.name}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              Running real-world application testing scenarios. Your work helps improve performance and user experience 
              for millions of users globally. Algorithm execution in progress...
            </p>
            <div className="text-xs text-blue-600 dark:text-blue-400">
              • Executing {selectedApp.algorithms.join(' • ')} • Analyzing {selectedApp.technicalMetrics.join(' • ')}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AvailableOptimizationTasks;