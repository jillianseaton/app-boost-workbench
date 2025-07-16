import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Target, BarChart3, Users, MousePointer } from "lucide-react";
import { Link } from "react-router-dom";

const OptimizationServices = () => {
  const services = [
    {
      icon: Target,
      title: "Application Testing",
      description: "Comprehensive testing methodologies to ensure your applications perform flawlessly across all platforms and user scenarios.",
      features: ["Automated Testing", "Performance Testing", "Cross-Platform Validation", "Bug Detection & Resolution"]
    },
    {
      icon: Users,
      title: "User Experience Optimization",
      description: "Data-driven UX improvements that enhance user satisfaction and increase conversion rates through strategic design optimization.",
      features: ["User Journey Analysis", "A/B Testing", "Interface Design", "Conversion Rate Optimization"]
    },
    {
      icon: BarChart3,
      title: "Performance Monitoring",
      description: "Real-time monitoring and analytics to track application performance, identify bottlenecks, and optimize system efficiency.",
      features: ["Real-time Analytics", "Performance Metrics", "System Optimization", "Load Testing"]
    },
    {
      icon: MousePointer,
      title: "Advertisement Interaction",
      description: "Strategic ad placement optimization and interaction analysis to maximize revenue while maintaining excellent user experience.",
      features: ["Ad Performance Analysis", "Placement Optimization", "Revenue Maximization", "User Experience Balance"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4">Professional Services</Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Optimization Services
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Our optimization tasks include application testing, user experience optimization, 
            performance monitoring, and advertisement interaction. All tasks are legitimate 
            business activities that help improve digital products and services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/contact">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/about">Learn More</Link>
            </Button>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {services.map((service, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900 group-hover:scale-110 transition-transform">
                    <service.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base mb-4">
                  {service.description}
                </CardDescription>
                <div className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Business Legitimacy Section */}
        <Card className="mb-16">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Legitimate Business Activities</CardTitle>
            <CardDescription>
              All our optimization services are conducted within ethical and legal frameworks
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Ethical Practices</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  All testing and optimization activities follow industry best practices and ethical guidelines
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Transparent Reporting</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Clear documentation and reporting of all optimization activities and results
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Business Compliance</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Full compliance with business regulations and digital marketing standards
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to Optimize Your Digital Products?</CardTitle>
              <CardDescription>
                Contact us today to learn how our optimization services can improve your business outcomes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link to="/contact">
                    Contact Us <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/dashboard">View Dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OptimizationServices;