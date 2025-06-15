
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStripeChargeCapture } from '@/hooks/useStripeChargeCapture';
import { Loader2, CreditCard, DollarSign } from 'lucide-react';

const StripeChargeCapture: React.FC = () => {
  const [chargeId, setChargeId] = useState('');
  const [amount, setAmount] = useState('');
  const [captureType, setCaptureType] = useState<'full' | 'partial'>('full');
  const { loading, captureCharge } = useStripeChargeCapture();

  const handleCapture = async () => {
    if (!chargeId.trim()) {
      return;
    }

    const request: any = {
      chargeId: chargeId.trim(),
    };

    if (captureType === 'partial' && amount) {
      request.amount = Math.round(parseFloat(amount) * 100); // Convert to cents
    }

    try {
      await captureCharge(request);
      // Reset form on success
      setChargeId('');
      setAmount('');
      setCaptureType('full');
    } catch (error) {
      // Error is handled in the hook
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Stripe Charge Capture
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="chargeId">Charge ID</Label>
            <Input
              id="chargeId"
              placeholder="ch_1234567890abcdef"
              value={chargeId}
              onChange={(e) => setChargeId(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Enter the Stripe charge ID to capture (e.g., ch_3Ln3cj2eZvKYlo2C1lcnB8f6)
            </p>
          </div>

          <div className="space-y-3">
            <Label>Capture Type</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="captureType"
                  value="full"
                  checked={captureType === 'full'}
                  onChange={() => setCaptureType('full')}
                  disabled={loading}
                />
                <span>Full Capture</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="captureType"
                  value="partial"
                  checked={captureType === 'partial'}
                  onChange={() => setCaptureType('partial')}
                  disabled={loading}
                />
                <span>Partial Capture</span>
              </label>
            </div>
          </div>

          {captureType === 'partial' && (
            <div className="space-y-2">
              <Label htmlFor="amount">Amount to Capture ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="10.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          <Button 
            onClick={handleCapture} 
            disabled={loading || !chargeId.trim() || (captureType === 'partial' && !amount)}
            className="w-full"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Capturing Charge...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                {captureType === 'full' ? 'Capture Full Amount' : `Capture $${amount || '0.00'}`}
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">About Charge Capture</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• <strong>Authorization vs Capture:</strong> Some charges are authorized but not captured immediately</p>
            <p>• <strong>Full Capture:</strong> Captures the entire authorized amount</p>
            <p>• <strong>Partial Capture:</strong> Captures only part of the authorized amount</p>
            <p>• <strong>Time Limit:</strong> Authorized charges must be captured within 7 days</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StripeChargeCapture;
