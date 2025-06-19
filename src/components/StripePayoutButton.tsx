
import React, { useEffect } from 'react';

interface StripePayoutButtonProps {
  buyButtonId?: string;
  publishableKey?: string;
  className?: string;
}

const StripePayoutButton: React.FC<StripePayoutButtonProps> = ({
  buyButtonId = "buy_btn_1RbpMlGIoraPHMELAjijf7bb",
  publishableKey = "pk_live_51RZkCqGIoraPHMELZURKQITI8fcY0NseoxLJRUwOEf5PO3YdzeuNhMrO4Wq2jO4tR8UU6GyTtaWkYgN4ueSms6kx00ypdzNAsl",
  className = ""
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
      <stripe-buy-button
        buy-button-id={buyButtonId}
        publishable-key={publishableKey}
      />
    </div>
  );
};

export default StripePayoutButton;
