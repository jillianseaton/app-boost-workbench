
import React from 'react';
import { useNavigate } from 'react-router-dom';
import StripePayment from '@/components/StripePayment';

const StripePaymentPage = () => {
  const navigate = useNavigate();

  return (
    <StripePayment
      onBack={() => navigate('/')}
      amount={49.99}
      description="EarnFlow Operator License - Monthly Subscription"
    />
  );
};

export default StripePaymentPage;
