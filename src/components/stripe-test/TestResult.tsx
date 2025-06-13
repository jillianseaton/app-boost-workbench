
import React from 'react';
import { StatusIcon, StatusBadge, TestStatus } from './StatusDisplay';

export interface TestResultData {
  name: string;
  status: TestStatus;
  message?: string;
}

interface TestResultProps {
  result: TestResultData;
}

const TestResult: React.FC<TestResultProps> = ({ result }) => {
  return (
    <div className="flex items-center justify-between p-2 border rounded">
      <div className="flex items-center gap-2">
        <StatusIcon status={result.status} />
        <span className="text-sm">{result.name}</span>
      </div>
      <div className="flex items-center gap-2">
        <StatusBadge status={result.status} />
        {result.message && (
          <span className="text-xs text-muted-foreground max-w-40 truncate">
            {result.message}
          </span>
        )}
      </div>
    </div>
  );
};

export default TestResult;
