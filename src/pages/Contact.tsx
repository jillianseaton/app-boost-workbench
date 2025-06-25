
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MessageSquare, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Contact = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-4xl space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-primary">Contact Us</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                For general inquiries and support requests
              </p>
              <a 
                href="mailto:support@earnflow.com" 
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                support@earnflow.com
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Live Chat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Available Monday-Friday, 9 AM - 6 PM EST
              </p>
              <Button className="w-full">
                Start Live Chat
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Phone Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                For urgent matters and payment issues
              </p>
              <a 
                href="tel:+1-555-EARNFLOW" 
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                +1 (555) EARN-FLOW
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Business Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-gray-600">
                <p>Monday - Friday: 9:00 AM - 6:00 PM EST</p>
                <p>Saturday: 10:00 AM - 4:00 PM EST</p>
                <p>Sunday: Closed</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900">How do I get paid?</h4>
              <p className="text-gray-600">
                Payments are processed through Stripe and other secure payment processors. 
                You can set up automatic payouts or request manual withdrawals.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">When do I receive my earnings?</h4>
              <p className="text-gray-600">
                Earnings are typically processed within 2-3 business days after completion 
                of tasks and verification of partner commissions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Is my personal information safe?</h4>
              <p className="text-gray-600">
                Yes, we use industry-standard encryption and never sell your personal 
                information to third parties. View our Privacy Policy for more details.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contact;
