
import React from 'react';
import PrivacyPolicy from '@/components/PrivacyPolicy';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicyPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <PrivacyPolicy onBack={handleBack} />
  );
};

export default PrivacyPolicyPage;
