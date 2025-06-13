
import React from 'react';
import TestResult, { TestResultData } from './TestResult';

interface TestResultsProps {
  results: TestResultData[];
}

const TestResults: React.FC<TestResultsProps> = ({ results }) => {
  if (results.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h4 className="font-medium">Test Results:</h4>
      {results.map((result, index) => (
        <TestResult key={index} result={result} />
      ))}
    </div>
  );
};

export default TestResults;
