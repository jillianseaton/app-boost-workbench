
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, TestTube } from 'lucide-react';
import { useStripeTests } from '@/hooks/useStripeTests';
import TestResultsList from '@/components/stripe-test/TestResultsList';
import InfoCards from '@/components/stripe-test/InfoCards';

const StripeIntegrationTest: React.FC = () => {
  const { testing, results, runTests } = useStripeTests();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Stripe Integration Test Suite
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Test all Stripe backend endpoints and verify HTTPS deployment
          </p>
          <Button 
            onClick={runTests} 
            disabled={testing}
            size="sm"
          >
            {testing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <TestTube className="h-4 w-4 mr-2" />
                Run Tests
              </>
            )}
          </Button>
        </div>

        <TestResultsList results={results} />
        <InfoCards />
      </CardContent>
    </Card>
  );
};

export default StripeIntegrationTest;
