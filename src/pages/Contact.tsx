
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

        {/* Support Resources */}
        <Card>
          <CardHeader>
            <CardTitle>Support Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Getting Started Guide</h4>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h5 className="font-medium text-blue-900">Account Setup</h5>
                  <p className="text-blue-800 text-sm">Step-by-step instructions for creating your account and connecting payment methods</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h5 className="font-medium text-green-900">First Task</h5>
                  <p className="text-green-800 text-sm">Complete your first optimization task and understand the earning process</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h5 className="font-medium text-purple-900">Payment Setup</h5>
                  <p className="text-purple-800 text-sm">Configure Bitcoin wallets, bank accounts, and payout preferences</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <h5 className="font-medium text-orange-900">Optimization Tips</h5>
                  <p className="text-orange-800 text-sm">Best practices for maximizing your earnings and task efficiency</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Technical Support</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <h5 className="font-medium">Platform Status</h5>
                    <p className="text-sm text-gray-600">Real-time system status and scheduled maintenance</p>
                  </div>
                  <Button variant="outline" size="sm">Check Status</Button>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <h5 className="font-medium">API Documentation</h5>
                    <p className="text-sm text-gray-600">Complete API reference for developers and integrations</p>
                  </div>
                  <Button variant="outline" size="sm">View Docs</Button>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <h5 className="font-medium">Troubleshooting</h5>
                    <p className="text-sm text-gray-600">Common issues and solutions for platform problems</p>
                  </div>
                  <Button variant="outline" size="sm">Get Help</Button>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Community & Updates</h4>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 border rounded-lg">
                  <h5 className="font-medium mb-2">Discord Community</h5>
                  <p className="text-sm text-gray-600 mb-3">Join our active community for tips, updates, and peer support</p>
                  <Button size="sm" className="w-full">Join Discord</Button>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <h5 className="font-medium mb-2">Newsletter</h5>
                  <p className="text-sm text-gray-600 mb-3">Weekly updates on new partners, features, and earning opportunities</p>
                  <Button size="sm" className="w-full">Subscribe</Button>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <h5 className="font-medium mb-2">Blog</h5>
                  <p className="text-sm text-gray-600 mb-3">Industry insights, platform updates, and earning strategy guides</p>
                  <Button size="sm" className="w-full">Read Blog</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle>Send Us a Message</CardTitle>
            <p className="text-gray-600">Can't find what you're looking for? Send us a detailed message and we'll get back to you within 24 hours.</p>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" className="w-full p-2 border border-gray-300 rounded-md" placeholder="Your full name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" className="w-full p-2 border border-gray-300 rounded-md" placeholder="your.email@example.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select className="w-full p-2 border border-gray-300 rounded-md">
                  <option>General Inquiry</option>
                  <option>Technical Support</option>
                  <option>Payment Issue</option>
                  <option>Partnership Opportunity</option>
                  <option>Bug Report</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea rows={6} className="w-full p-2 border border-gray-300 rounded-md" placeholder="Please provide as much detail as possible..."></textarea>
              </div>
              <Button className="w-full">Send Message</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contact;
