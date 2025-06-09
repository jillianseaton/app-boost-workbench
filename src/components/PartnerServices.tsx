
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Users, ShoppingCart, Check } from 'lucide-react';

const PartnerServices: React.FC = () => {
  const [purchasedServices, setPurchasedServices] = useState<Set<number>>(new Set());
  const [processingPurchase, setProcessingPurchase] = useState<number | null>(null);
  const { toast } = useToast();

  const thirdPartyApps = [
    { name: "StreamMax Pro", product: "Premium Streaming Service", price: 29.99 },
    { name: "FitTracker Elite", product: "Advanced Fitness Tracker", price: 199.99 },
    { name: "CloudSync Business", product: "Enterprise Cloud Storage", price: 49.99 },
    { name: "GameVault Premium", product: "Gaming Subscription", price: 19.99 },
    { name: "DesignSuite Pro", product: "Creative Design Tools", price: 89.99 },
    { name: "LearnHub Academy", product: "Online Course Platform", price: 39.99 }
  ];

  const handlePurchase = async (index: number, service: typeof thirdPartyApps[0]) => {
    setProcessingPurchase(index);

    try {
      // Simulate purchase processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      setPurchasedServices(prev => new Set(prev).add(index));
      
      toast({
        title: "Purchase Successful!",
        description: `You have successfully purchased ${service.name} for $${service.price}`,
      });
    } catch (error) {
      toast({
        title: "Purchase Failed",
        description: "There was an error processing your purchase. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingPurchase(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Our Partner Services
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Enhance your experience with our premium partner services
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {thirdPartyApps.map((app, index) => {
            const isPurchased = purchasedServices.has(index);
            const isProcessing = processingPurchase === index;

            return (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div>
                  <h4 className="font-semibold">{app.name}</h4>
                  <p className="text-sm text-muted-foreground">{app.product}</p>
                  <p className="text-lg font-bold text-green-600">${app.price}</p>
                </div>
                
                {isPurchased ? (
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    disabled
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Purchased
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handlePurchase(index, app)}
                    disabled={isProcessing}
                    className="w-full"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Buy Now
                      </>
                    )}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
        
        {purchasedServices.size > 0 && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Your Purchased Services</h4>
            <p className="text-sm text-green-700">
              You have purchased {purchasedServices.size} service{purchasedServices.size > 1 ? 's' : ''}. 
              Access details will be sent to your registered email.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PartnerServices;
