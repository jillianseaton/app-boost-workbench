
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface AccountCreationStepProps {
  onCreateAccount: () => void;
  isLoading: boolean;
  hasError: boolean;
}

const AccountCreationStep: React.FC<AccountCreationStepProps> = ({
  onCreateAccount,
  isLoading,
  hasError
}) => {
  return (
    <div className="text-center space-y-4">
      <h3 className="text-xl font-semibold">Get ready to start earning</h3>
      <p className="text-muted-foreground">
        Create your Stripe Connect account to begin accepting payments and receiving payouts.
      </p>
      
      {!isLoading ? (
        <Button 
          onClick={onCreateAccount}
          size="lg"
          className="w-full max-w-sm"
        >
          Create Stripe Account
        </Button>
      ) : (
        <Button disabled size="lg" className="w-full max-w-sm">
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Creating Account...
        </Button>
      )}

      {hasError && (
        <div className="text-center p-4 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-destructive font-medium">Something went wrong!</p>
          <p className="text-sm text-muted-foreground mt-1">
            Please try again or contact support if the issue persists.
          </p>
        </div>
      )}
    </div>
  );
};

export default AccountCreationStep;
