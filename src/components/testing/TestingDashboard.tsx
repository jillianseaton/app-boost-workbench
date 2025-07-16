import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Download,
  TrendingUp,
  Activity,
  TestTube,
  Code
} from 'lucide-react';

interface TestResult {
  id: string;
  name: string;
  status: 'passing' | 'failing' | 'pending' | 'running';
  duration: number;
  coverage?: number;
  details?: string;
  timestamp: Date;
}

interface PipelineRun {
  id: string;
  branch: string;
  commit: string;
  status: 'success' | 'failure' | 'running' | 'pending';
  startTime: Date;
  duration?: number;
  tests: TestResult[];
}

const TestingDashboard = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [selectedSuite, setSelectedSuite] = useState('all');

  // Mock data - in a real implementation, this would come from your CI/CD system
  const [currentRun, setCurrentRun] = useState<PipelineRun>({
    id: 'run-1234',
    branch: 'main',
    commit: 'abc123f',
    status: 'success',
    startTime: new Date(),
    duration: 245,
    tests: [
      {
        id: 'unit-1',
        name: 'Authentication Components',
        status: 'passing',
        duration: 1200,
        coverage: 95,
        timestamp: new Date(),
      },
      {
        id: 'unit-2',
        name: 'Payment Processing',
        status: 'passing',
        duration: 850,
        coverage: 88,
        timestamp: new Date(),
      },
      {
        id: 'integration-1',
        name: 'Supabase Integration',
        status: 'passing',
        duration: 3200,
        coverage: 92,
        timestamp: new Date(),
      },
      {
        id: 'e2e-1',
        name: 'User Registration Flow',
        status: 'passing',
        duration: 8500,
        timestamp: new Date(),
      },
      {
        id: 'e2e-2',
        name: 'Payment Workflow',
        status: 'failing',
        duration: 5200,
        details: 'Timeout waiting for payment confirmation',
        timestamp: new Date(),
      },
      {
        id: 'security-1',
        name: 'Security Vulnerability Scan',
        status: 'passing',
        duration: 2100,
        timestamp: new Date(),
      },
    ],
  });

  const [testMetrics] = useState({
    totalTests: 147,
    passingTests: 142,
    failingTests: 3,
    pendingTests: 2,
    overallCoverage: 91.2,
    performanceScore: 94,
    securityScore: 98,
  });

  const runTests = async () => {
    setIsRunning(true);
    
    // Simulate test execution
    const testSuites = ['unit', 'integration', 'e2e', 'security'];
    
    for (const suite of testSuites) {
      // Update test status to running
      setCurrentRun(prev => ({
        ...prev,
        status: 'running',
        tests: prev.tests.map(test => 
          test.name.toLowerCase().includes(suite) 
            ? { ...test, status: 'running' as const }
            : test
        ),
      }));
      
      // Simulate test duration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update to completed
      setCurrentRun(prev => ({
        ...prev,
        tests: prev.tests.map(test => 
          test.name.toLowerCase().includes(suite) 
            ? { ...test, status: 'passing' as const, timestamp: new Date() }
            : test
        ),
      }));
    }
    
    setCurrentRun(prev => ({ ...prev, status: 'success' }));
    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passing':
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failing':
      case 'failure':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'passing':
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Passing</Badge>;
      case 'failing':
      case 'failure':
        return <Badge className="bg-red-100 text-red-800">Failing</Badge>;
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800">Running</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const filteredTests = selectedSuite === 'all' 
    ? currentRun.tests 
    : currentRun.tests.filter(test => 
        test.name.toLowerCase().includes(selectedSuite.toLowerCase())
      );

  return (
    <div className="space-y-6">
      {/* Pipeline Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Pipeline Status
            </CardTitle>
            <CardDescription>
              Latest test run on branch {currentRun.branch} • Commit {currentRun.commit}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={runTests}
              disabled={isRunning}
              size="sm"
              className="flex items-center gap-2"
            >
              {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isRunning ? 'Running...' : 'Run Tests'}
            </Button>
            <Button variant="outline" size="sm">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-center gap-3">
              {getStatusIcon(currentRun.status)}
              <div>
                <div className="text-2xl font-bold">
                  {currentRun.status === 'success' ? 'Success' : 'Running'}
                </div>
                <div className="text-sm text-gray-600">Overall Status</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{currentRun.duration || 0}s</div>
                <div className="text-sm text-gray-600">Duration</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TestTube className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{testMetrics.passingTests}</div>
                <div className="text-sm text-gray-600">Passing Tests</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Code className="h-8 w-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{testMetrics.overallCoverage}%</div>
                <div className="text-sm text-gray-600">Coverage</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Test Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Overall Coverage</span>
                <span className="text-sm font-medium">{testMetrics.overallCoverage}%</span>
              </div>
              <Progress value={testMetrics.overallCoverage} className="h-2" />
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>Lines: 94.2%</div>
                <div>Functions: 89.1%</div>
                <div>Branches: 87.3%</div>
                <div>Statements: 92.8%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Lighthouse Score</span>
                <span className="text-sm font-medium">{testMetrics.performanceScore}</span>
              </div>
              <Progress value={testMetrics.performanceScore} className="h-2" />
              <div className="text-xs text-gray-600">
                Performance tests measure page load time, interactivity, and visual stability
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Security Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Security Rating</span>
                <span className="text-sm font-medium">{testMetrics.securityScore}</span>
              </div>
              <Progress value={testMetrics.securityScore} className="h-2" />
              <div className="text-xs text-gray-600">
                Vulnerability scans and security best practices compliance
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Suite Filter */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'unit', 'integration', 'e2e', 'security'].map((suite) => (
          <Button
            key={suite}
            variant={selectedSuite === suite ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedSuite(suite)}
          >
            {suite === 'all' ? 'All Tests' : `${suite.charAt(0).toUpperCase() + suite.slice(1)} Tests`}
          </Button>
        ))}
      </div>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
          <CardDescription>
            Detailed results for {selectedSuite === 'all' ? 'all test suites' : `${selectedSuite} tests`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredTests.map((test) => (
              <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  {getStatusIcon(test.status)}
                  <div className="flex-1">
                    <h3 className="font-semibold">{test.name}</h3>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>Duration: {test.duration}ms</span>
                      {test.coverage && <span>Coverage: {test.coverage}%</span>}
                      <span>Run: {test.timestamp.toLocaleTimeString()}</span>
                    </div>
                    {test.details && (
                      <div className="text-sm text-red-600 mt-1">{test.details}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(test.status)}
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Test Execution History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Test Runs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div>
                    <div className="font-medium">Run #{1234 - i}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(Date.now() - i * 3600000).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">Success</Badge>
                  <span className="text-sm text-gray-600">{245 + i * 10}s</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestingDashboard;