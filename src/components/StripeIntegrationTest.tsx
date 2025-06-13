
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TestTube } from 'lucide-react';
import TestRunner from './stripe-test/TestRunner';
import TestResults from './stripe-test/TestResults';
import { TestResultData } from './stripe-test/TestResult';

const StripeIntegrationTest: React.FC = () => {
  const [results, setResults] = useState<TestResultData[]>([]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Stripe Integration Test Suite
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <TestRunner onResultsUpdate={setResults} />

        <TestResults results={results} />

        <div className="p-3 bg-green-50 rounded-md border border-green-200">
          <p className="text-sm text-green-800">
            <strong>HTTPS Ready:</strong> This test suite automatically detects your current protocol (HTTP/HTTPS) and 
            configures all URLs accordingly. Your Stripe integration will work properly over HTTPS in production.
          </p>
        </div>

        <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> This test suite verifies that all Stripe edge functions are deployed and working correctly. 
            The tests create minimal test data to verify connectivity without affecting real transactions.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StripeIntegrationTest;
