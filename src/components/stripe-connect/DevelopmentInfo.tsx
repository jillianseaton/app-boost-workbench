
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface DevelopmentInfoProps {
  connectedAccountId?: string;
  accountCreatePending: boolean;
  onboardingExited: boolean;
}

const DevelopmentInfo: React.FC<DevelopmentInfoProps> = ({
  connectedAccountId,
  accountCreatePending,
  onboardingExited
}) => {
  if (!connectedAccountId && !accountCreatePending && !onboardingExited) {
    return null;
  }

  return (
    <div className="space-y-3 p-4 bg-muted rounded-md">
      <h4 className="font-semibold text-sm">Development Information</h4>
      {connectedAccountId && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Account ID:</Badge>
          <code className="text-xs bg-background px-2 py-1 rounded font-mono">
            {connectedAccountId}
          </code>
        </div>
      )}
      {accountCreatePending && (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Creating connected account...</span>
        </div>
      )}
      {onboardingExited && (
        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
          Onboarding Completed
        </Badge>
      )}
    </div>
  );
};

export default DevelopmentInfo;
