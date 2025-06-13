
import React from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export type TestStatus = 'pending' | 'success' | 'error';

interface StatusDisplayProps {
  status: TestStatus;
}

export const StatusIcon: React.FC<StatusDisplayProps> = ({ status }) => {
  switch (status) {
    case 'success':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'error':
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Loader2 className="h-4 w-4 animate-spin" />;
  }
};

export const StatusBadge: React.FC<StatusDisplayProps> = ({ status }) => {
  switch (status) {
    case 'success':
      return <Badge variant="default" className="bg-green-500">Pass</Badge>;
    case 'error':
      return <Badge variant="destructive">Fail</Badge>;
    default:
      return <Badge variant="secondary">Testing...</Badge>;
  }
};
