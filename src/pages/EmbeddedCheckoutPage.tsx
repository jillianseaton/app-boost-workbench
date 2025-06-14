
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StripeEmbeddedCheckout from '@/components/StripeEmbeddedCheckout';

const EmbeddedCheckoutPage: React.FC = () => {
  const { priceId } = useParams<{ priceId: string }>();
  const navigate = useNavigate();

  if (!priceId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="container mx-auto max-w-2xl space-y-6">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">Invalid checkout link</p>
            <button onClick={() => navigate('/')}>Return Home</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <StripeEmbeddedCheckout
      priceId={priceId}
      onBack={() => navigate('/')}
      title="Subscribe to EarnFlow"
      description="Get your operator license and start earning today"
    />
  );
};

export default EmbeddedCheckoutPage;
