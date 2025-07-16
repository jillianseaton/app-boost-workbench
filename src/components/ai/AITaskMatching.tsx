import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Target, 
  Zap, 
  TrendingUp, 
  Clock, 
  DollarSign,
  Star,
  User,
  Settings,
  BarChart3,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Timer
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const AITaskMatching = () => {
  const { user } = useAuth();
  const [matchingScore, setMatchingScore] = useState(0);
  const [personalizedTasks, setPersonalizedTasks] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [skillAnalysis, setSkillAnalysis] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // AI-generated task recommendations based on user profile
  const aiGeneratedTasks = [
    {
      id: 1,
      title: 'Amazon Product Review Campaign',
      description: 'Write detailed reviews for tech products on Amazon Associates program',
      category: 'Content Creation',
      estimatedEarning: '$45-85',
      timeRequired: '2-3 hours',
      difficulty: 'Medium',
      matchScore: 95,
      skills: ['Writing', 'Product Analysis', 'SEO'],
      urgency: 'High',
      partner: 'Amazon Associates',
      deadline: '2024-03-25',
      requirements: ['Previous Amazon reviews', 'Tech product knowledge', 'SEO basics'],
      aiReason: 'Perfect match based on your writing skills and tech product expertise'
    },
    {
      id: 2,
      title: 'SaaS Trial Conversion Optimization',
      description: 'Test and optimize sign-up flows for B2B SaaS platforms',
      category: 'UX Testing',
      estimatedEarning: '$120-180',
      timeRequired: '4-5 hours',
      difficulty: 'Hard',
      matchScore: 88,
      skills: ['UX Design', 'Analytics', 'A/B Testing'],
      urgency: 'Medium',
      partner: 'HubSpot Partners',
      deadline: '2024-03-28',
      requirements: ['UX/UI experience', 'Analytics tools knowledge', 'B2B understanding'],
      aiReason: 'Matches your analytical skills and SaaS industry experience'
    },
    {
      id: 3,
      title: 'Cryptocurrency Educational Content',
      description: 'Create beginner-friendly guides about cryptocurrency trading',
      category: 'Educational Content',
      estimatedEarning: '$75-150',
      timeRequired: '3-4 hours',
      difficulty: 'Medium',
      matchScore: 82,
      skills: ['Writing', 'Cryptocurrency', 'Education'],
      urgency: 'Low',
      partner: 'Coinbase Affiliate',
      deadline: '2024-04-01',
      requirements: ['Crypto knowledge', 'Clear writing style', 'Educational background'],
      aiReason: 'Your crypto knowledge and educational content skills align perfectly'
    },
    {
      id: 4,
      title: 'E-commerce Store Setup Consultation',
      description: 'Help small businesses set up their Shopify stores',
      category: 'Consulting',
      estimatedEarning: '$200-350',
      timeRequired: '6-8 hours',
      difficulty: 'Hard',
      matchScore: 76,
      skills: ['E-commerce', 'Shopify', 'Business Consulting'],
      urgency: 'High',
      partner: 'Shopify Partners',
      deadline: '2024-03-27',
      requirements: ['Shopify experience', 'E-commerce knowledge', 'Client communication'],
      aiReason: 'Leverages your e-commerce background and consulting abilities'
    },
    {
      id: 5,
      title: 'Social Media Campaign Analytics',
      description: 'Analyze and report on influencer marketing campaign performance',
      category: 'Analytics',
      estimatedEarning: '$90-160',
      timeRequired: '3-4 hours',
      difficulty: 'Medium',
      matchScore: 71,
      skills: ['Social Media', 'Analytics', 'Reporting'],
      urgency: 'Medium',
      partner: 'Impact Radius',
      deadline: '2024-03-30',
      requirements: ['Social media analytics', 'Data visualization', 'Marketing knowledge'],
      aiReason: 'Good fit for your analytical and social media skills'
    }
  ];

  const userSkillProfile = {
    technical: 85,
    creative: 72,
    analytical: 91,
    communication: 78,
    salesMarketing: 68,
    leadership: 55
  };

  const aiInsights = [
    {
      type: 'strength',
      title: 'Analytical Excellence',
      description: 'Your analytical skills are in the top 10% of our user base. Focus on data-driven tasks.',
      impact: 'High',
      recommendation: 'Target analytics and optimization tasks for maximum earnings'
    },
    {
      type: 'opportunity',
      title: 'Technical Skill Development',
      description: 'Improving your technical skills by 15% could unlock $300+ higher-value tasks.',
      impact: 'Medium',
      recommendation: 'Consider online courses in Python or data analysis'
    },
    {
      type: 'trend',
      title: 'AI Content Creation Demand',
      description: 'AI-assisted content creation tasks have increased 340% this quarter.',
      impact: 'High',
      recommendation: 'Learn AI tools like ChatGPT API integration for content tasks'
    },
    {
      type: 'warning',
      title: 'Market Saturation Alert',
      description: 'Basic social media tasks are becoming oversaturated. Pivot to specialized areas.',
      impact: 'Medium',
      recommendation: 'Focus on niche areas like B2B social media or technical content'
    }
  ];

  useEffect(() => {
    // Simulate AI analysis
    setIsAnalyzing(true);
    
    // Simulate user profile analysis
    setTimeout(() => {
      setUserProfile({
        completedTasks: 247,
        successRate: 94,
        averageRating: 4.8,
        specializations: ['Analytics', 'Content Creation', 'Tech Reviews'],
        preferredCategories: ['SaaS', 'E-commerce', 'Cryptocurrency'],
        workingHours: 'Flexible',
        timezone: 'UTC-5'
      });
      
      setMatchingScore(87);
      setPersonalizedTasks(aiGeneratedTasks);
      setRecommendations(aiInsights);
      setSkillAnalysis([
        { skill: 'Data Analysis', current: 91, target: 95, growth: '+4%' },
        { skill: 'Content Writing', current: 78, target: 85, growth: '+9%' },
        { skill: 'Technical Knowledge', current: 85, target: 92, growth: '+8%' },
        { skill: 'Client Communication', current: 72, target: 80, growth: '+11%' },
        { skill: 'Project Management', current: 68, target: 75, growth: '+10%' }
      ]);
      
      setIsAnalyzing(false);
    }, 2000);
  }, [user]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'High': return 'destructive';
      case 'Medium': return 'default';
      case 'Low': return 'secondary';
      default: return 'outline';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'strength': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'opportunity': return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case 'trend': return <BarChart3 className="h-5 w-5 text-purple-500" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default: return <Lightbulb className="h-5 w-5" />;
    }
  };

  if (isAnalyzing) {
    return (
      <div className="space-y-6">
        <Card className="p-8">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <h3 className="text-lg font-semibold">AI is analyzing your profile...</h3>
            <p className="text-muted-foreground">
              Our machine learning algorithms are finding the perfect tasks for you
            </p>
            <Progress value={matchingScore} className="max-w-md mx-auto" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Matching Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/20">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">AI-Powered Task Matching</h1>
                <p className="text-muted-foreground">
                  Personalized opportunities based on your skills and performance
                </p>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{matchingScore}%</div>
              <div className="text-sm text-muted-foreground">Match Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{personalizedTasks.length}</div>
                <div className="text-sm text-muted-foreground">Matched Tasks</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">$1,240</div>
                <div className="text-sm text-muted-foreground">Potential Earnings</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{userProfile?.averageRating}</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">4</div>
                <div className="text-sm text-muted-foreground">High Priority</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tasks">Matched Tasks</TabsTrigger>
          <TabsTrigger value="skills">Skill Analysis</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="settings">ML Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <div className="grid gap-4">
            {personalizedTasks.map((task) => (
              <Card key={task.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="flex items-center gap-2">
                        {task.title}
                        <Badge variant={getUrgencyColor(task.urgency)}>
                          {task.urgency} Priority
                        </Badge>
                      </CardTitle>
                      <CardDescription>{task.description}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {task.matchScore}%
                      </div>
                      <div className="text-sm text-muted-foreground">Match</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Earnings:</span>
                      <div className="font-medium">{task.estimatedEarning}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Time:</span>
                      <div className="font-medium">{task.timeRequired}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Difficulty:</span>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${getDifficultyColor(task.difficulty)}`} />
                        {task.difficulty}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Deadline:</span>
                      <div className="font-medium flex items-center gap-1">
                        <Timer className="h-3 w-3" />
                        {task.deadline}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Required Skills:</div>
                    <div className="flex flex-wrap gap-1">
                      {task.skills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Brain className="h-4 w-4 text-blue-500 mt-0.5" />
                      <div className="text-sm">
                        <span className="font-medium text-blue-700 dark:text-blue-300">AI Insight: </span>
                        <span className="text-blue-600 dark:text-blue-400">{task.aiReason}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button className="flex-1">Accept Task</Button>
                    <Button variant="outline">Learn More</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Skill Development Recommendations</CardTitle>
              <CardDescription>
                AI-powered analysis of your skill progression and improvement areas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {skillAnalysis.map((skill, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{skill.skill}</span>
                    <div className="text-sm text-muted-foreground">
                      {skill.current}% → {skill.target}% ({skill.growth})
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Progress value={skill.current} className="h-2" />
                    <Progress value={skill.target} className="h-1 opacity-50" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            {recommendations.map((insight, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{insight.title}</h4>
                        <Badge variant={insight.impact === 'High' ? 'destructive' : 'default'}>
                          {insight.impact} Impact
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                      <div className="bg-muted p-2 rounded text-sm">
                        <span className="font-medium">Recommendation: </span>
                        {insight.recommendation}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Matching Preferences</CardTitle>
              <CardDescription>
                Customize how our AI algorithms match tasks to your profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Preferred Task Categories</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['Analytics', 'Content Creation', 'SaaS', 'E-commerce', 'Crypto'].map((category) => (
                      <Badge key={category} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Risk Tolerance</label>
                  <Progress value={70} className="mt-2" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Conservative</span>
                    <span>Moderate</span>
                    <span>Aggressive</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Minimum Hourly Rate</label>
                  <div className="text-2xl font-bold mt-1">$35/hour</div>
                </div>
                
                <Button>Update Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AITaskMatching;