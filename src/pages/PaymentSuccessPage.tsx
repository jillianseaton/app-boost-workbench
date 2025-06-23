
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-green-600">
              Payment Successful!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Thank you for your payment to Lovable.dev. Your transaction has been processed successfully 
              and the funds have been deposited into our Stripe account.
            </p>
            
            <p className="text-sm text-gray-500">
              You should receive a confirmation email from Stripe shortly with your payment details.
            </p>

            <div className="pt-4">
              <Button onClick={() => navigate('/')} className="mr-2">
                Return to Dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.close()}
              >
                Close Window
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
