
import React from 'react';
import { ExternalLink } from 'lucide-react';

const DocumentationNote: React.FC = () => {
  return (
    <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
      <p className="text-sm text-blue-800">
        <strong>Note:</strong> This is a Connect onboarding implementation using Stripe's embedded components.{' '}
        <a 
          href="https://docs.stripe.com/connect/onboarding/quickstart?connect-onboarding-surface=embedded" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 underline hover:no-underline"
        >
          View documentation
          <ExternalLink className="h-3 w-3" />
        </a>
      </p>
    </div>
  );
};

export default DocumentationNote;
