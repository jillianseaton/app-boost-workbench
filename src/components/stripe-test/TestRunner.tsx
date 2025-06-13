
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Play } from 'lucide-react';
import { TestResultData } from './TestResult';
import { stripeConnectedAccountService } from '@/services/stripeConnectedAccountService';

interface TestRunnerProps {
  onResultsUpdate: (results: TestResultData[]) => void;
}

const TestRunner: React.FC<TestRunnerProps> = ({ onResultsUpdate }) => {
  const [running, setRunning] = useState(false);

  const runTests = async () => {
    setRunning(true);
    const results: TestResultData[] = [];

    // Test 1: Create Express Account with Prefilled Data
    results.push({ name: 'Express Account Creation', status: 'pending' });
    onResultsUpdate([...results]);

    try {
      const expressResult = await stripeConnectedAccountService.createExpressAccount({
        email: 'test-express@example.com',
        country: 'US',
        accountType: 'express',
        businessType: 'individual',
        businessName: 'Test Express Business',
        productDescription: 'Test product for Express account',
        firstName: 'John',
        lastName: 'Doe',
        userId: 'test_express_user',
        platformSource: 'test_suite',
      });

      results[results.length - 1] = {
        name: 'Express Account Creation',
        status: expressResult.success ? 'success' : 'error',
        message: expressResult.success 
          ? `Account ${expressResult.data?.accountId} created successfully`
          : expressResult.error || 'Failed to create Express account'
      };
    } catch (error) {
      results[results.length - 1] = {
        name: 'Express Account Creation',
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    onResultsUpdate([...results]);

    // Test 2: Create Custom Account with Prefilled Data
    results.push({ name: 'Custom Account Creation', status: 'pending' });
    onResultsUpdate([...results]);

    try {
      const customResult = await stripeConnectedAccountService.createCustomAccount({
        email: 'test-custom@example.com',
        country: 'US',
        accountType: 'custom',
        businessType: 'company',
        businessName: 'Test Custom Business',
        productDescription: 'Test product for Custom account',
        companyName: 'Test Custom Corp',
        taxId: '12-3456789',
        userId: 'test_custom_user',
        platformSource: 'test_suite',
      });

      results[results.length - 1] = {
        name: 'Custom Account Creation',
        status: customResult.success ? 'success' : 'error',
        message: customResult.success 
          ? `Account ${customResult.data?.accountId} created successfully`
          : customResult.error || 'Failed to create Custom account'
      };
    } catch (error) {
      results[results.length - 1] = {
        name: 'Custom Account Creation',
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    onResultsUpdate([...results]);

    // Test 3: Create Standard Account with Prefilled Data
    results.push({ name: 'Standard Account Creation', status: 'pending' });
    onResultsUpdate([...results]);

    try {
      const standardResult = await stripeConnectedAccountService.createStandardAccount({
        email: 'test-standard@example.com',
        country: 'US',
        accountType: 'standard',
        businessType: 'individual',
        businessName: 'Test Standard Business',
        userId: 'test_standard_user',
        platformSource: 'test_suite',
      });

      results[results.length - 1] = {
        name: 'Standard Account Creation',
        status: standardResult.success ? 'success' : 'error',
        message: standardResult.success 
          ? `Account ${standardResult.data?.accountId} created successfully`
          : standardResult.error || 'Failed to create Standard account'
      };
    } catch (error) {
      results[results.length - 1] = {
        name: 'Standard Account Creation',
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    onResultsUpdate([...results]);
    setRunning(false);
  };

  return (
    <Button onClick={runTests} disabled={running} className="w-full">
      {running ? (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Running Prefilled Account Tests...
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Play className="h-4 w-4" />
          Run Prefilled Account Creation Tests
        </div>
      )}
    </Button>
  );
};

export default TestRunner;
