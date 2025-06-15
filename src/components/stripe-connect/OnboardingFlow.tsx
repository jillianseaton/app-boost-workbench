
import React from 'react';
import { Loader2 } from 'lucide-react';
import {
  ConnectAccountOnboarding,
  ConnectComponentsProvider,
} from '@stripe/react-connect-js';

interface OnboardingFlowProps {
  stripeConnectInstance: any;
  onboardingExited: boolean;
  onOnboardingExit: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  stripeConnectInstance,
  onboardingExited,
  onOnboardingExit
}) => {
  if (!stripeConnectInstance && !onboardingExited) {
    return (
      <div className="text-center space-y-4">
        <h3 className="text-xl font-semibold">Complete your account setup</h3>
        <p className="text-muted-foreground">
          Loading onboarding form to complete your account information...
        </p>
        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </div>
    );
  }

  if (stripeConnectInstance && !onboardingExited) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-center">Complete Your Onboarding</h3>
        <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
          <ConnectAccountOnboarding onExit={onOnboardingExit} />
        </ConnectComponentsProvider>
      </div>
    );
  }

  return null;
};

export default OnboardingFlow;
