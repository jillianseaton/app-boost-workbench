
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Play, Pause, TrendingUp, Users, Target } from 'lucide-react';

const ABTesting = () => {
  const [testName, setTestName] = useState('');
  const [hypothesis, setHypothesis] = useState('');

  const activeTests = [
    {
      id: 1,
      name: 'Homepage Hero CTA',
      status: 'running',
      visitors: 2450,
      conversionA: 3.2,
      conversionB: 4.1,
      confidence: 92,
      uplift: 28.1
    },
    {
      id: 2,
      name: 'Pricing Page Layout',
      status: 'running',
      visitors: 1890,
      conversionA: 2.8,
      conversionB: 3.5,
      confidence: 85,
      uplift: 25.0
    }
  ];

  const completedTests = [
    {
      id: 3,
      name: 'Checkout Form Optimization',
      status: 'completed',
      visitors: 5230,
      conversionA: 12.3,
      conversionB: 15.7,
      confidence: 99,
      uplift: 27.6,
      winner: 'B'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="container mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">A/B Testing</h1>
          <p className="text-muted-foreground">Create and manage conversion optimization tests</p>
        </div>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Active Tests</TabsTrigger>
            <TabsTrigger value="completed">Completed Tests</TabsTrigger>
            <TabsTrigger value="create">Create New Test</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <div className="space-y-4">
              {activeTests.map((test) => (
                <Card key={test.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        {test.name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800">Running</Badge>
                        <Button size="sm" variant="outline">
                          <Pause className="h-4 w-4 mr-1" />
                          Pause
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{test.visitors}</div>
                        <div className="text-sm text-muted-foreground">Visitors</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{test.conversionA}%</div>
                        <div className="text-sm text-muted-foreground">Control (A)</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{test.conversionB}%</div>
                        <div className="text-sm text-muted-foreground">Variant (B)</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">+{test.uplift}%</div>
                        <div className="text-sm text-muted-foreground">Uplift</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{test.confidence}%</div>
                        <div className="text-sm text-muted-foreground">Confidence</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="completed">
            <div className="space-y-4">
              {completedTests.map((test) => (
                <Card key={test.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        {test.name}
                      </CardTitle>
                      <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{test.visitors}</div>
                        <div className="text-sm text-muted-foreground">Visitors</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{test.conversionA}%</div>
                        <div className="text-sm text-muted-foreground">Control (A)</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{test.conversionB}%</div>
                        <div className="text-sm text-muted-foreground">Variant (B)</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">+{test.uplift}%</div>
                        <div className="text-sm text-muted-foreground">Uplift</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{test.confidence}%</div>
                        <div className="text-sm text-muted-foreground">Confidence</div>
                      </div>
                      <div className="text-center">
                        <Badge className="bg-green-100 text-green-800">
                          Winner: {test.winner}
                        </Badge>
                        <div className="text-sm text-muted-foreground mt-1">Result</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Create New A/B Test</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="testName">Test Name</Label>
                  <Input
                    id="testName"
                    placeholder="e.g., Homepage CTA Button Color"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hypothesis">Hypothesis</Label>
                  <Input
                    id="hypothesis"
                    placeholder="e.g., Changing the CTA button color to red will increase clicks by 15%"
                    value={hypothesis}
                    onChange={(e) => setHypothesis(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Traffic Split</Label>
                    <Input placeholder="50% / 50%" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Minimum Sample Size</Label>
                    <Input placeholder="1,000 visitors per variant" disabled />
                  </div>
                </div>

                <Button className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  Create and Start Test
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ABTesting;
