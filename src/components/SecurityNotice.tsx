
import React from 'react';

const SecurityNotice: React.FC = () => {
  return (
    <div className="text-xs text-muted-foreground text-center">
      <p>🔒 Your payment information is encrypted and secure</p>
      <p>Powered by Stripe - Industry standard security</p>
    </div>
  );
};

export default SecurityNotice;
