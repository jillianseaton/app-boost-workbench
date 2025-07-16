import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Shield, Zap, Award, Users, Globe } from 'lucide-react';

const DashboardContent = () => {
  const insights = [
    {
      title: "Maximize Your Earnings",
      description: "Learn strategies to optimize your task completion and boost your daily earnings potential.",
      content: [
        "Complete tasks during peak hours for higher ad revenue",
        "Maintain consistent daily activity to unlock bonus multipliers",
        "Focus on quality interactions to improve your earning rate",
        "Use the automatic payout feature to compound your Bitcoin holdings"
      ],
      icon: TrendingUp,
      category: "Strategy"
    },
    {
      title: "Security Best Practices",
      description: "Keep your account and earnings secure with these essential security measures.",
      content: [
        "Enable two-factor authentication on your account",
        "Use strong, unique passwords for all connected services",
        "Regularly review your transaction history for any suspicious activity",
        "Keep your payout wallet information updated and secure"
      ],
      icon: Shield,
      category: "Security"
    },
    {
      title: "Understanding Bitcoin Earnings",
      description: "Learn how your task earnings are converted to Bitcoin and what affects the conversion rate.",
      content: [
        "Earnings are converted to Bitcoin using real-time market rates",
        "Bitcoin price fluctuations affect your earning value in USD",
        "Consider market timing when deciding to withdraw your earnings",
        "Track your Bitcoin accumulation over time for better planning"
      ],
      icon: Zap,
      category: "Education"
    }
  ];

  const achievements = [
    { name: "First Task", description: "Complete your first optimization task", icon: Award },
    { name: "Daily Streak", description: "Complete tasks for 7 consecutive days", icon: Users },
    { name: "Bitcoin Hodler", description: "Accumulate 0.001 BTC in earnings", icon: Globe }
  ];

  return (
    <div className="space-y-6">
      {/* Insights Section */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Earning Insights & Tips
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {insights.map((insight, index) => (
            <Card key={index} className="h-full">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <insight.icon className="h-5 w-5 text-blue-600" />
                  <Badge variant="secondary" className="text-xs">
                    {insight.category}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{insight.title}</CardTitle>
                <CardDescription className="text-sm">
                  {insight.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700">
                  {insight.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Achievement Badges */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Available Achievements
        </h3>
        <div className="grid gap-3 md:grid-cols-3">
          {achievements.map((achievement, index) => (
            <Card key={index} className="text-center p-4">
              <achievement.icon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900 mb-1">{achievement.name}</h4>
              <p className="text-xs text-gray-600">{achievement.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Educational Content */}
      <Card>
        <CardHeader>
          <CardTitle>How Task Optimization Works</CardTitle>
          <CardDescription>
            Understanding the technology behind your earnings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none text-gray-700">
            <p className="mb-3">
              Our task optimization system uses advanced algorithms to simulate real-world 
              application testing scenarios. When you complete a task, you're helping improve 
              the performance and user experience of various applications and services.
            </p>
            <p className="mb-3">
              <strong>The Process:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-1 mb-3">
              <li>Select an optimization task from available applications</li>
              <li>Run the simulation which tests various performance metrics</li>
              <li>Receive earnings based on the complexity and duration of the task</li>
              <li>Earnings are automatically converted to Bitcoin at current market rates</li>
            </ol>
            <p>
              The earning amounts are determined by factors including task complexity, 
              current Bitcoin price, and overall platform performance. Higher-value tasks 
              may become available as you complete more optimizations and build your reputation.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardContent;