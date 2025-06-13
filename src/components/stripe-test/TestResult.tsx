
import React from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
}

interface TestResultProps {
  result: TestResult;
}

const TestResultItem: React.FC<TestResultProps> = ({ result }) => {
  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Pass</Badge>;
      case 'error':
        return <Badge variant="destructive">Fail</Badge>;
      default:
        return <Badge variant="secondary">Testing...</Badge>;
    }
  };

  return (
    <div className="flex items-center justify-between p-2 border rounded">
      <div className="flex items-center gap-2">
        {getStatusIcon(result.status)}
        <span className="text-sm">{result.name}</span>
      </div>
      <div className="flex items-center gap-2">
        {getStatusBadge(result.status)}
        {result.message && (
          <span className="text-xs text-muted-foreground max-w-40 truncate">
            {result.message}
          </span>
        )}
      </div>
    </div>
  );
};

export default TestResultItem;
