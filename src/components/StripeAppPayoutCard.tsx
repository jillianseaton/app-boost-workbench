import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { stripeAppPayoutService } from '@/services/stripeAppPayoutService';
import { supabase } from '@/integrations/supabase/client';
import { 
  DollarSign, 
  Loader2, 
  CreditCard, 
  Clock, 
  Zap,
  AlertCircle,
  CheckCircle,
  Coins
} from 'lucide-react';

interface Commission {
  id: string;
  amount_earned_cents: number;
  source: string;
  description: string;
  created_at: string;
}

const StripeAppPayoutCard = () => {
  const [payoutType, setPayoutType] = useState<'commissions' | 'manual'>('commissions');
  const [amount, setAmount] = useState('');
  const [stripeAccountId, setStripeAccountId] = useState('');
  const [method, setMethod] = useState<'standard' | 'instant'>('standard');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [commissionsLoading, setCommissionsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch unpaid commissions
  useEffect(() => {
    if (user && payoutType === 'commissions') {
      fetchCommissions();
    }
  }, [user, payoutType]);

  const fetchCommissions = async () => {
    if (!user) return;
    
    setCommissionsLoading(true);
    try {
      const { data, error } = await supabase
        .from('commissions')
        .select('id, amount_earned_cents, source, description, created_at')
        .eq('user_id', user.id)
        .eq('paid_out', false)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setCommissions(data || []);
    } catch (error) {
      console.error('Failed to fetch commissions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch commission data",
        variant: "destructive",
      });
    } finally {
      setCommissionsLoading(false);
    }
  };

  const totalCommissions = commissions.reduce((sum, c) => sum + c.amount_earned_cents, 0);
  const totalCommissionsUSD = totalCommissions / 100;

  const handlePayout = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please sign in first",
        variant: "destructive",
      });
      return;
    }

    if (payoutType === 'commissions' && commissions.length === 0) {
      toast({
        title: "No Commissions",
        description: "You have no unpaid commissions to cash out",
        variant: "destructive",
      });
      return;
    }

    if (payoutType === 'manual' && (!amount || parseFloat(amount) < 1)) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount of at least $1.00",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Initiating app payout:', { 
        payoutType, 
        amount: payoutType === 'manual' ? parseFloat(amount) : undefined,
        stripeAccountId: stripeAccountId || undefined,
        method,
        description
      });
      
      const result = await stripeAppPayoutService.createAppPayout({
        payoutType,
        amount: payoutType === 'manual' ? parseFloat(amount) : undefined,
        stripeAccountId: stripeAccountId || undefined,
        method,
        description: description || undefined
      });

      if (result.success && result.data) {
        toast({
          title: "Payout Initiated",
          description: `$${result.data.amountUSD.toFixed(2)} payout ${result.data.isSimulation ? 'simulated' : 'initiated'}. ${stripeAppPayoutService.getEstimatedArrival(method)}`,
        });
        
        // Reset form
        setAmount('');
        setDescription('');
        
        // Refresh commissions if it was a commission payout
        if (payoutType === 'commissions') {
          fetchCommissions();
        }
      } else {
        throw new Error(result.error || 'Payout failed');
      }
    } catch (error) {
      console.error('Payout error:', error);
      toast({
        title: "Payout Failed",
        description: error instanceof Error ? error.message : "Failed to process payout",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            App Payouts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please sign in to access payout functionality.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            App Payouts
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Cash out your earnings through Stripe
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payout Type Selection */}
          <div className="space-y-3">
            <Label>Payout Type</Label>
            <RadioGroup
              value={payoutType}
              onValueChange={(value) => setPayoutType(value as 'commissions' | 'manual')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="commissions" id="commissions" />
                <Label htmlFor="commissions" className="flex items-center gap-2">
                  <Coins className="h-4 w-4" />
                  Cash Out Commissions
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="manual" id="manual" />
                <Label htmlFor="manual" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Manual Payout
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Commissions Summary */}
          {payoutType === 'commissions' && (
            <div className="p-4 bg-muted rounded-lg">
              {commissionsLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading commissions...</span>
                </div>
              ) : commissions.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Available Commissions:</span>
                    <Badge variant="default" className="text-lg">
                      ${totalCommissionsUSD.toFixed(2)}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {commissions.length} unpaid commission{commissions.length !== 1 ? 's' : ''}
                  </div>
                  
                  {/* Recent Commissions List */}
                  <div className="mt-3 space-y-1 max-h-32 overflow-y-auto">
                    {commissions.slice(0, 5).map((commission) => (
                      <div key={commission.id} className="flex justify-between text-xs">
                        <span className="truncate">
                          {commission.description || commission.source}
                        </span>
                        <span className="font-mono">
                          ${(commission.amount_earned_cents / 100).toFixed(2)}
                        </span>
                      </div>
                    ))}
                    {commissions.length > 5 && (
                      <div className="text-xs text-muted-foreground">
                        +{commissions.length - 5} more...
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <span>No unpaid commissions available</span>
                </div>
              )}
            </div>
          )}

          {/* Manual Amount Input */}
          {payoutType === 'manual' && (
            <div className="space-y-2">
              <Label htmlFor="payout-amount">Payout Amount ($)</Label>
              <Input
                id="payout-amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                step="0.01"
              />
            </div>
          )}

          {/* Stripe Account ID (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="account-id">Stripe Account ID (Optional)</Label>
            <Input
              id="account-id"
              type="text"
              placeholder="acct_... (leave empty for platform account)"
              value={stripeAccountId}
              onChange={(e) => setStripeAccountId(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              For Express account payouts. Leave empty for platform payouts.
            </p>
          </div>

          {/* Payout Method */}
          <div className="space-y-3">
            <Label>Payout Speed</Label>
            <RadioGroup
              value={method}
              onValueChange={(value) => setMethod(value as 'standard' | 'instant')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="standard" id="standard" />
                <Label htmlFor="standard" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Standard (1-2 business days)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="instant" id="instant" />
                <Label htmlFor="instant" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Instant (within 30 minutes)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Description (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add a note for this payout..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* Payout Button */}
          <Button 
            onClick={handlePayout} 
            disabled={
              loading || 
              (payoutType === 'commissions' && commissions.length === 0) ||
              (payoutType === 'manual' && (!amount || parseFloat(amount) < 1))
            }
            className="w-full"
            size="lg"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing Payout...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span>
                  {payoutType === 'commissions' 
                    ? `Cash Out $${totalCommissionsUSD.toFixed(2)}` 
                    : `Payout ${amount ? `$${parseFloat(amount).toFixed(2)}` : '$0.00'}`
                  }
                </span>
                {method === 'instant' && <Zap className="h-4 w-4" />}
              </div>
            )}
          </Button>
          
          <div className="text-xs text-muted-foreground text-center">
            {method === 'instant' 
              ? 'Instant payouts arrive within 30 minutes (additional fees may apply)' 
              : 'Standard payouts arrive in 1-2 business days (no additional fees)'
            }
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StripeAppPayoutCard;