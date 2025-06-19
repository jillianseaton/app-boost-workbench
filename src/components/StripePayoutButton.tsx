
import React, { useEffect } from 'react';

interface StripePayoutButtonProps {
  buyButtonId?: string;
  publishableKey?: string;
  className?: string;
  title?: string;
  description?: string;
}

const StripePayoutButton: React.FC<StripePayoutButtonProps> = ({
  buyButtonId = "buy_btn_1RbpMlGIoraPHMELAjijf7bb",
  publishableKey = "pk_live_51RZkCqGIoraPHMELZURKQITI8fcY0NseoxLJRUwOEf5PO3YdzeuNhMrO4Wq2jO4tR8UU6GyTtaWkYgN4ueSms6kx00ypdzNAsl",
  className = "",
  title = "Quick Payout",
  description = "Process your payout quickly and securely with Stripe"
}) => {
  useEffect(() => {
    // Ensure the Stripe buy button script is loaded
    if (!document.querySelector('script[src="https://js.stripe.com/v3/buy-button.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/buy-button.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div className={className}>
      <div className="bg-white rounded-xl p-6 shadow-md max-w-md mx-auto">
        <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
          {title}
        </h3>
        <p className="text-gray-600 mb-6 text-center">
          {description}
        </p>
        <div className="flex justify-center">
          <stripe-buy-button
            buy-button-id={buyButtonId}
            publishable-key={publishableKey}
          />
        </div>
      </div>
    </div>
  );
};

export default StripePayoutButton;
