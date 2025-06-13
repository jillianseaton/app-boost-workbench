
import React from 'react';

const InfoCards: React.FC = () => {
  return (
    <>
      <div className="p-3 bg-green-50 rounded-md border border-green-200">
        <p className="text-sm text-green-800">
          <strong>HTTPS Ready:</strong> This test suite automatically detects your current protocol (HTTP/HTTPS) and 
          configures all URLs accordingly. Your Stripe integration will work properly over HTTPS in production.
        </p>
      </div>

      <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> This test suite verifies that all Stripe edge functions are deployed and working correctly. 
          The tests create minimal test data to verify connectivity without affecting real transactions.
        </p>
      </div>
    </>
  );
};

export default InfoCards;
