import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowRight, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Zap,
  CheckCircle,
  Clock,
  AlertCircle,
  Webhook,
  Database,
  CreditCard
} from "lucide-react";

interface RevenueFlowDemoProps {
  onSimulateConversion?: () => void;
}

const RevenueFlowDemo: React.FC<RevenueFlowDemoProps> = ({ onSimulateConversion }) => {
  const [simulationStep, setSimulationStep] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);

  const revenueSteps = [
    {
      icon: Users,
      title: "User Clicks Affiliate Link",
      description: "User discovers partner service through your optimization platform",
      status: "tracking",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: ArrowRight,
      title: "Redirect with Tracking",
      description: "User redirected to partner with unique affiliate tracking ID",
      status: "processing",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      icon: CreditCard,
      title: "Partner Service Subscription",
      description: "User completes subscription purchase on partner platform",
      status: "conversion",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: Webhook,
      title: "Webhook Notification",
      description: "Partner sends conversion data via webhook or API callback",
      status: "webhook",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: Database,
      title: "Commission Recorded",
      description: "System validates and records commission in your database",
      status: "database",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      icon: DollarSign,
      title: "Revenue Generated",
      description: "Commission appears in your earnings, ready for withdrawal",
      status: "complete",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    }
  ];

  const partnerServices = [
    {
      name: "Shopify Plus",
      type: "E-commerce Platform",
      commissionRate: "25%",
      avgCommission: "$89.50",
      conversionRate: "8.2%",
      revenueShare: "Direct API Integration"
    },
    {
      name: "Canva Pro",
      type: "Design Software",
      commissionRate: "15%", 
      avgCommission: "$12.75",
      conversionRate: "12.5%",
      revenueShare: "Commission Junction"
    },
    {
      name: "HBO Max",
      type: "Streaming Service",
      commissionRate: "10%",
      avgCommission: "$4.99",
      conversionRate: "18.3%",
      revenueShare: "Impact Network"
    },
    {
      name: "Flower Delivery",
      type: "E-commerce",
      commissionRate: "12%",
      avgCommission: "$8.25",
      conversionRate: "6.8%",
      revenueShare: "Commission Junction"
    }
  ];

  const handleSimulateRevenue = async () => {
    setIsSimulating(true);
    setSimulationStep(0);

    for (let i = 0; i <= 5; i++) {
      setTimeout(() => {
        setSimulationStep(i + 1);
        if (i === 5) {
          setIsSimulating(false);
          if (onSimulateConversion) {
            onSimulateConversion();
          }
        }
      }, i * 1500);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-6 w-6 text-green-600" />
            <CardTitle className="text-xl">Partner Affiliate Revenue Flow</CardTitle>
          </div>
          <Button 
            onClick={handleSimulateRevenue}
            disabled={isSimulating}
            size="sm"
            className="text-xs"
          >
            <Zap className="h-3 w-3 mr-1" />
            {isSimulating ? 'Simulating...' : 'Simulate Revenue'}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          How partner service subscriptions generate revenue on your platform
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Revenue Flow Steps */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <ArrowRight className="h-5 w-5 mr-2 text-blue-500" />
            Revenue Generation Process
          </h3>
          <div className="space-y-3">
            {revenueSteps.map((step, index) => (
              <div 
                key={index} 
                className={`flex items-start space-x-4 p-3 rounded-lg border transition-all duration-300 ${
                  simulationStep > index ? step.bgColor : 'bg-gray-50'
                } ${simulationStep === index + 1 ? 'ring-2 ring-blue-400' : ''}`}
              >
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    simulationStep > index ? step.bgColor : 'bg-gray-100'
                  }`}>
                    {simulationStep > index ? (
                      <CheckCircle className={`h-4 w-4 ${step.color}`} />
                    ) : simulationStep === index + 1 ? (
                      <Clock className="h-4 w-4 text-blue-500 animate-spin" />
                    ) : (
                      <step.icon className={`h-4 w-4 ${simulationStep >= index + 1 ? step.color : 'text-gray-400'}`} />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm mb-1">{step.title}</h4>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${simulationStep > index ? step.color : 'text-gray-400'}`}
                >
                  Step {index + 1}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Live Partner Services */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-green-500" />
            Active Partner Revenue Streams
          </h3>
          <div className="grid gap-4">
            {partnerServices.map((service, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-sm">{service.name}</h4>
                    <p className="text-xs text-muted-foreground">{service.type}</p>
                  </div>
                  <Badge className="text-xs bg-green-100 text-green-800">
                    {service.commissionRate} Commission
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <p className="text-muted-foreground">Avg Commission</p>
                    <p className="font-semibold text-green-600">{service.avgCommission}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Conversion Rate</p>
                    <p className="font-semibold">{service.conversionRate}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Integration</p>
                    <p className="font-semibold text-xs">{service.revenueShare}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Integration Methods */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <Webhook className="h-5 w-5 mr-2 text-blue-500" />
            Revenue Integration Methods
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span><strong>Real-time Webhooks:</strong> Instant conversion notifications</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span><strong>Commission Junction:</strong> Publisher ID 7602933</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span><strong>Direct API Integration:</strong> Shopify, Canva, others</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span><strong>Impact Network:</strong> Campaign-based tracking</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span><strong>Conversion Validation:</strong> Anti-fraud protection</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span><strong>Automated Payouts:</strong> Bitcoin conversion & withdrawal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Simulation Result */}
        {simulationStep === 6 && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-800">Revenue Generated Successfully!</span>
            </div>
            <p className="text-sm text-green-700">
              Partner subscription converted to <strong>$12.75 commission</strong> and automatically added to your Bitcoin earnings.
              Transaction ID: <code className="bg-white px-1 rounded">conv_sim_{Date.now()}</code>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RevenueFlowDemo;