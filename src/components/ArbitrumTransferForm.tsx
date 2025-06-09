
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ExternalLink } from 'lucide-react';

interface TransferFormData {
  to: string;
  amount: string;
  tokenAddress?: string;
}

export const ArbitrumTransferForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string>('');
  const { toast } = useToast();
  
  const form = useForm<TransferFormData>({
    defaultValues: {
      to: '',
      amount: '',
      tokenAddress: '',
    },
  });

  const onSubmit = async (data: TransferFormData) => {
    setIsLoading(true);
    setTxHash('');

    try {
      console.log('Sending Arbitrum transfer request:', data);

      const { data: result, error } = await supabase.functions.invoke('crypto-transfer', {
        body: {
          to: data.to,
          amount: data.amount,
          tokenAddress: data.tokenAddress || undefined,
        },
      });

      if (error) {
        throw error;
      }

      if (!result.success) {
        throw new Error(result.error || 'Transfer failed');
      }

      setTxHash(result.txHash);
      
      toast({
        title: "Transaction Successful!",
        description: `${data.tokenAddress ? 'Token' : 'ETH'} transfer completed on Arbitrum`,
      });

      // Reset form
      form.reset();

    } catch (error: any) {
      console.error('Transfer error:', error);
      
      toast({
        title: "Transfer Failed",
        description: error.message || "Unable to process transfer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-blue-600">🔵</span>
          Send ETH or Tokens on Arbitrum
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="to"
              rules={{
                required: "Recipient address is required",
                pattern: {
                  value: /^0x[a-fA-F0-9]{40}$/,
                  message: "Please enter a valid Ethereum address"
                }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient Address</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="0x..." 
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              rules={{
                required: "Amount is required",
                pattern: {
                  value: /^\d+(\.\d+)?$/,
                  message: "Please enter a valid amount"
                }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (ETH or Token)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="0.1" 
                      type="text"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tokenAddress"
              rules={{
                pattern: {
                  value: /^(0x[a-fA-F0-9]{40})?$/,
                  message: "Please enter a valid token contract address"
                }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Token Contract Address (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Leave blank to send ETH" 
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to send ETH, or enter ERC-20 token contract address
                  </p>
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending Transaction...
                </>
              ) : (
                'Send on Arbitrum'
              )}
            </Button>
          </form>
        </Form>

        {txHash && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-green-600">✅</span>
              <span className="font-medium text-green-800">Transaction Sent!</span>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-green-700 font-mono break-all">
                {txHash}
              </p>
              <a
                href={`https://arbiscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm underline"
              >
                View on Arbiscan
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        )}

        <div className="mt-4 text-xs text-muted-foreground">
          <p>• Leave token address empty to send ETH</p>
          <p>• Enter ERC-20 contract address to send tokens</p>
          <p>• Transactions are sent on Arbitrum One network</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ArbitrumTransferForm;
