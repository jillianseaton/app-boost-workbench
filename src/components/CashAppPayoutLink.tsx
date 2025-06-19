
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Smartphone, Link, Copy, ExternalLink } from 'lucide-react';
import { useCashAppPayoutLink } from '@/hooks/useCashAppPayoutLink';
import { useToast } from '@/hooks/use-toast';

interface CashAppPayoutLinkProps {
  userEmail: string;
  userId: string;
}

const CashAppPayoutLink: React.FC<CashAppPayoutLinkProps> = ({
  userEmail,
  userId,
}) => {
  const [amount, setAmount] = useState('');
  const [cashAppTag, setCashAppTag] = useState('');
  const [description, setDescription] = useState('');
  const [payoutUrl, setPayoutUrl] = useState('');
  const { loading, createPayoutLink } = useCashAppPayoutLink();
  const { toast } = useToast();

  const handleCreatePayoutLink = async () => {
    const payoutAmount = parseFloat(amount);
    
    if (!payoutAmount || payoutAmount < 1.00) {
      toast({
        title: "Invalid Amount",
        description: "Minimum payout amount is $1.00",
        variant: "destructive",
      });
      return;
    }

    if (!cashAppTag.trim() || !cashAppTag.startsWith('$')) {
      toast({
        title: "Invalid Cash App Tag",
        description: "Please enter a valid Cash App tag (e.g., $username)",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await createPayoutLink({
        amount: payoutAmount,
        cashAppTag: cashAppTag.trim(),
        description: description.trim() || undefined,
        userId,
        email: userEmail,
      });

      setPayoutUrl(result.payoutUrl);
    } catch (error) {
      console.error('Failed to create payout link:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(payoutUrl);
      toast({
        title: "Link Copied",
        description: "Payout link has been copied to clipboard",
      });
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast({
        title: "Copy Failed",
        description: "Failed to copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const formatCashAppTag = (value: string) => {
    let formatted = value.replace(/^\$+/, '');
    if (formatted && !formatted.startsWith('$')) {
      formatted = '$' + formatted;
    }
    return formatted;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Create Cash App Payout Link
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!payoutUrl ? (
          <>
            <div className="space-y-3">
              <div>
                <Label htmlFor="amount">Payout Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  step="0.01"
                />
              </div>

              <div>
                <Label htmlFor="cashAppTag">Cash App Tag</Label>
                <Input
                  id="cashAppTag"
                  type="text"
                  placeholder="$username"
                  value={cashAppTag}
                  onChange={(e) => setCashAppTag(formatCashAppTag(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Payout description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <Button
              onClick={handleCreatePayoutLink}
              disabled={loading || !amount || !cashAppTag}
              className="w-full"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating Link...
                </>
              ) : (
                <>
                  <Link className="h-4 w-4 mr-2" />
                  Create Payout Link
                </>
              )}
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-md border border-green-200">
              <h3 className="font-medium text-green-800 mb-2">Payout Link Created!</h3>
              <p className="text-sm text-green-700">
                Share this link to allow the recipient to receive their Cash App payout.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Payout Link</Label>
              <div className="flex gap-2">
                <Input
                  value={payoutUrl}
                  readOnly
                  className="bg-muted"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(payoutUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                setPayoutUrl('');
                setAmount('');
                setCashAppTag('');
                setDescription('');
              }}
              className="w-full"
            >
              Create Another Link
            </Button>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p><strong>Note:</strong> This creates a shareable link that allows the recipient to receive a Cash App payout. The link will redirect them through Stripe's secure payment processing.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CashAppPayoutLink;
