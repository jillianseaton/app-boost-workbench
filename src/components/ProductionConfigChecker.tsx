
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { stripeService } from '@/services/stripeService';
import { useToast } from '@/hooks/use-toast';

interface ConfigCheckResult {
  isProductionReady: boolean;
  issues: string[];
}

const ProductionConfigChecker: React.FC = () => {
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<ConfigCheckResult | null>(null);
  const { toast } = useToast();

  const runConfigCheck = async () => {
    setChecking(true);
    try {
      const configResult = await stripeService.verifyProductionConfig();
      setResult(configResult);
      
      if (configResult.isProductionReady) {
        toast({
          title: "Production Ready ✅",
          description: "Your Stripe configuration is ready for live payments.",
        });
      } else {
        toast({
          title: "Configuration Issues Found",
          description: `Found ${configResult.issues.length} issue(s) that need attention.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Config check failed:', error);
      toast({
        title: "Configuration Check Failed",
        description: "Unable to verify production configuration.",
        variant: "destructive",
      });
    }
    setChecking(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Production Configuration Check
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Verify that your Stripe configuration is ready for live production payments.
        </p>
        
        <Button 
          onClick={runConfigCheck} 
          disabled={checking}
          className="w-full"
        >
          {checking ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Checking Configuration...
            </>
          ) : (
            'Run Production Check'
          )}
        </Button>

        {result && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2">
              {result.isProductionReady ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span className="font-medium">
                {result.isProductionReady ? 'Ready for Production' : 'Configuration Issues Found'}
              </span>
            </div>

            {result.issues.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Issues to resolve:</h4>
                <ul className="space-y-1">
                  {result.issues.map((issue, index) => (
                    <li key={index} className="text-sm text-red-600 flex items-start gap-2">
                      <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 p-3 bg-amber-50 rounded-md">
          <p className="text-sm text-amber-800">
            <strong>Before going live:</strong> Ensure your Stripe account is activated for live payments 
            and Cash App Pay is enabled in your Stripe Dashboard.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductionConfigChecker;
