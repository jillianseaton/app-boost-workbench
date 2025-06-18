
import React from 'react';
import { TrendingUp } from 'lucide-react';

const PartnershipInfo: React.FC = () => {
  return (
    <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
      <h5 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
        <TrendingUp className="h-5 w-5" />
        Real Affiliate Partnership Program
      </h5>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h6 className="font-semibold text-blue-800 mb-2">For You:</h6>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Access real premium services at competitive prices</li>
            <li>• Verified partnerships with trusted brands</li>
            <li>• Exclusive deals through our affiliate network</li>
            <li>• Support our platform at no additional cost</li>
          </ul>
        </div>
        <div>
          <h6 className="font-semibold text-blue-800 mb-2">Our Partnership Model:</h6>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Real commission earnings (4-25%)</li>
            <li>• Commission Junction (CJ Affiliate) integration</li>
            <li>• Direct partnerships with service providers</li>
            <li>• Monthly payout processing</li>
          </ul>
        </div>
      </div>
      <div className="mt-4 p-3 bg-white rounded border-l-4 border-green-500">
        <p className="text-sm text-green-800">
          <strong>✅ ACTIVE INTEGRATION:</strong> Your CJ Affiliate Publisher ID <strong>7602933</strong> is now integrated! 
          All 1-800-FLORALS affiliate links and optimization tasks are using YOUR actual CJ Publisher ID to ensure you earn real commissions.
        </p>
      </div>
      <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
        <p className="text-xs text-green-700">
          <strong>Publisher ID 7602933</strong> | All affiliate tracking and commission earning is now configured with your actual CJ Affiliate account.
        </p>
      </div>
    </div>
  );
};

export default PartnershipInfo;
