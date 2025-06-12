
import React from 'react';
import { useNavigate } from 'react-router-dom';
import DestinationCheckout from '@/components/DestinationCheckout';

const DestinationCheckoutPage = () => {
  const navigate = useNavigate();

  return (
    <DestinationCheckout
      onBack={() => navigate('/')}
    />
  );
};

export default DestinationCheckoutPage;
