import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Users, 
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Award,
  Lightbulb,
  Zap
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, BarChart, Bar, Pie } from 'recharts';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const AdvancedAnalyticsDashboard = () => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState({
    totalEarnings: 0,
    monthlyGrowth: 0,
    taskCompletion: 0,
    activePartners: 0,
    avgTaskValue: 0,
    optimizationScore: 0
  });
  
  const [earningsData, setEarningsData] = useState([]);
  const [taskDistribution, setTaskDistribution] = useState([]);
  const [partnerPerformance, setPartnerPerformance] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  // Sample data for demonstration
  const sampleEarningsData = [
    { date: '2024-01', earnings: 2400, tasks: 45 },
    { date: '2024-02', earnings: 3200, tasks: 58 },
    { date: '2024-03', earnings: 2800, tasks: 52 },
    { date: '2024-04', earnings: 4100, tasks: 67 },
    { date: '2024-05', earnings: 3900, tasks: 71 },
    { date: '2024-06', earnings: 4800, tasks: 89 },
  ];

  const sampleTaskDistribution = [
    { name: 'Affiliate Marketing', value: 35, color: '#8884d8' },
    { name: 'Content Creation', value: 25, color: '#82ca9d' },
    { name: 'Data Entry', value: 20, color: '#ffc658' },
    { name: 'Survey Completion', value: 15, color: '#ff7300' },
    { name: 'Product Testing', value: 5, color: '#0088fe' },
  ];

  const samplePartnerPerformance = [
    { partner: 'Amazon Associates', earnings: 1200, conversion: 8.5 },
    { partner: 'ClickBank', earnings: 890, conversion: 6.2 },
    { partner: 'ShareASale', earnings: 750, conversion: 5.8 },
    { partner: 'CJ Affiliate', earnings: 650, conversion: 4.9 },
    { partner: 'Impact Radius', earnings: 520, conversion: 4.1 },
  ];

  const sampleRecommendations = [
    {
      type: 'optimization',
      title: 'Increase Amazon Associates Focus',
      description: 'Your Amazon earnings have highest conversion rate. Consider allocating 40% more time here.',
      impact: 'High',
      estimatedIncrease: '$240/month'
    },
    {
      type: 'timing',
      title: 'Peak Performance Hours',
      description: 'Analytics show you perform 23% better between 2-4 PM. Schedule high-value tasks during this window.',
      impact: 'Medium',
      estimatedIncrease: '$180/month'
    },
    {
      type: 'partner',
      title: 'New Partner Opportunity',
      description: 'Based on your profile, Shopify Partners program could yield $150-300/month.',
      impact: 'High',
      estimatedIncrease: '$225/month'
    },
    {
      type: 'skill',
      title: 'Content Creation Skills',
      description: 'Adding video content creation could increase earnings by 35% based on market trends.',
      impact: 'Medium',
      estimatedIncrease: '$320/month'
    }
  ];

  useEffect(() => {
    // Simulate loading analytics data
    setAnalyticsData({
      totalEarnings: 4847,
      monthlyGrowth: 23.5,
      taskCompletion: 87,
      activePartners: 12,
      avgTaskValue: 54.30,
      optimizationScore: 78
    });
    
    setEarningsData(sampleEarningsData);
    setTaskDistribution(sampleTaskDistribution);
    setPartnerPerformance(samplePartnerPerformance);
    setRecommendations(sampleRecommendations);
  }, [user]);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'destructive';
      case 'Medium': return 'default';
      case 'Low': return 'secondary';
      default: return 'outline';
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'optimization': return <Target className="h-4 w-4" />;
      case 'timing': return <Clock className="h-4 w-4" />;
      case 'partner': return <Users className="h-4 w-4" />;
      case 'skill': return <Award className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analyticsData.totalEarnings.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              +{analyticsData.monthlyGrowth}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Task Completion</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.taskCompletion}%</div>
            <Progress value={analyticsData.taskCompletion} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Partners</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.activePartners}</div>
            <div className="text-xs text-muted-foreground">
              Across {analyticsData.activePartners} platforms
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Optimization Score</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.optimizationScore}/100</div>
            <Progress value={analyticsData.optimizationScore} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="earnings" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="partners">Partners</TabsTrigger>
          <TabsTrigger value="optimization">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="earnings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Earnings Trend
              </CardTitle>
              <CardDescription>
                Monthly earnings and task completion over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={earningsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="earnings" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="tasks" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Task Distribution
              </CardTitle>
              <CardDescription>
                Breakdown of tasks by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={taskDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({name, value}) => `${name}: ${value}%`}
                    >
                      {taskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {taskDistribution.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="partners" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Partner Performance
              </CardTitle>
              <CardDescription>
                Top performing affiliate partners by earnings and conversion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={partnerPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="partner" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="earnings" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                AI-Powered Recommendations
              </CardTitle>
              <CardDescription>
                Personalized optimization suggestions to maximize your earnings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {recommendations.map((rec, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        {getRecommendationIcon(rec.type)}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{rec.title}</h4>
                          <Badge variant={getImpactColor(rec.impact)}>
                            {rec.impact} Impact
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{rec.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-green-600">
                            Est. increase: {rec.estimatedIncrease}
                          </span>
                          <Button size="sm" variant="outline">
                            Apply Suggestion
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;