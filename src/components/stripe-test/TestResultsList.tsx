
import React from 'react';
import TestResultItem, { TestResult } from './TestResult';

interface TestResultsListProps {
  results: TestResult[];
}

const TestResultsList: React.FC<TestResultsListProps> = ({ results }) => {
  if (results.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h4 className="font-medium">Test Results:</h4>
      {results.map((result, index) => (
        <TestResultItem key={index} result={result} />
      ))}
    </div>
  );
};

export default TestResultsList;
