import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cpu, TrendingUp, Bitcoin, Target, Zap, BarChart3 } from "lucide-react";

const TaskOptimizationInfo = () => {
  const processSteps = [
    {
      icon: Target,
      title: "Select Optimization Task",
      description: "Choose from available applications that need performance testing",
      color: "text-blue-600"
    },
    {
      icon: Cpu,
      title: "Run Performance Simulation",
      description: "Execute tests that analyze various performance metrics and user experience factors",
      color: "text-green-600"
    },
    {
      icon: TrendingUp,
      title: "Receive Task Earnings",
      description: "Earn based on complexity, duration, and quality of optimization work completed",
      color: "text-purple-600"
    },
    {
      icon: Bitcoin,
      title: "Auto-Convert to Bitcoin",
      description: "Earnings are automatically converted to Bitcoin at current market rates",
      color: "text-orange-600"
    }
  ];

  const earningFactors = [
    { label: "Task Complexity", description: "More complex optimizations yield higher rewards" },
    { label: "Current Bitcoin Price", description: "Market rates affect conversion amounts" },
    { label: "Platform Performance", description: "Overall system efficiency impacts earnings" },
    { label: "User Reputation", description: "Experienced users get access to higher-value tasks" }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          <CardTitle className="text-2xl">How Task Optimization Works</CardTitle>
        </div>
        <p className="text-muted-foreground">
          Understanding the technology behind your earnings
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Description */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Our task optimization system uses advanced algorithms to simulate real-world application testing scenarios. 
            When you complete a task, you're helping improve the performance and user experience of various applications and services.
          </p>
        </div>

        {/* The Process */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Zap className="h-5 w-5 mr-2 text-yellow-500" />
            The Process
          </h3>
          <div className="grid gap-4">
            {processSteps.map((step, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center border">
                    <step.icon className={`h-4 w-4 ${step.color}`} />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm mb-1">{step.title}</h4>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  Step {index + 1}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Earning Factors */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
            Earning Factors
          </h3>
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-4 rounded-lg border">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              The earning amounts are determined by factors including:
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {earningFactors.map((factor, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-sm">{factor.label}</p>
                    <p className="text-xs text-muted-foreground">{factor.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reputation Note */}
        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
          <p className="text-sm text-orange-800 dark:text-orange-200">
            <strong>Build Your Reputation:</strong> Higher-value tasks may become available as you complete more optimizations 
            and build your reputation on the platform. Consistent quality work unlocks premium optimization opportunities.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskOptimizationInfo;