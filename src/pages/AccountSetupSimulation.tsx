
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, ArrowLeft, Info } from 'lucide-react';

const AccountSetupSimulation = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center space-y-4">
          <Settings className="h-16 w-16 text-blue-500 mx-auto" />
          <h1 className="text-2xl font-bold text-gray-900">Account Setup Simulation</h1>
          <div className="p-4 bg-blue-50 rounded-md">
            <div className="flex items-start space-x-2">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm text-blue-800 font-medium mb-1">
                  Simulation Mode Active
                </p>
                <p className="text-sm text-blue-700">
                  You're using a restricted Stripe API key. For live Express accounts and real payouts, 
                  you'll need full API access and proper Stripe Connect setup.
                </p>
              </div>
            </div>
          </div>
          <p className="text-gray-600">
            This is a demonstration of the account setup flow. In production, this would connect 
            to Stripe's Express account onboarding process.
          </p>
          <div className="space-y-2">
            <Button 
              onClick={() => navigate('/account-setup-success')} 
              className="w-full"
            >
              Continue to Success Page
            </Button>
            <Button 
              onClick={() => navigate('/')} 
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSetupSimulation;
