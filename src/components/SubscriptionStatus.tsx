import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Calendar, RefreshCw, Settings, CheckCircle, AlertCircle } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';

interface SubscriptionStatusProps {
  showManageButton?: boolean;
  compact?: boolean;
}

const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({ 
  showManageButton = true,
  compact = false 
}) => {
  const {
    subscribed,
    planName,
    status,
    expiryDate,
    loading,
    error,
    refreshSubscription,
    openCustomerPortal,
    isActive
  } = useSubscription();
  
  const navigate = useNavigate();

  const getStatusColor = () => {
    if (error) return 'destructive';
    if (isActive) return 'default';
    return 'secondary';
  };

  const getStatusIcon = () => {
    if (error) return <AlertCircle className="h-4 w-4" />;
    if (isActive) return <CheckCircle className="h-4 w-4" />;
    return <CreditCard className="h-4 w-4" />;
  };

  const getPlanDisplayName = (plan: string) => {
    switch (plan) {
      case 'basic': return 'Basic Plan';
      case 'standard': return 'Standard Plan';
      case 'professional': return 'Professional Plan';
      case 'enterprise': return 'Enterprise Plan';
      case 'none': return 'No Active Plan';
      default: return plan;
    }
  };

  const getPlanPrice = (plan: string) => {
    switch (plan) {
      case 'basic': return '$9.99/month';
      case 'standard': return '$19.99/month';
      case 'professional': return '$29.99/month';
      case 'enterprise': return '$49.99/month';
      default: return '';
    }
  };

  if (loading) {
    return (
      <Card className={compact ? "p-4" : ""}>
        <CardContent className={compact ? "p-0" : "pt-6"}>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">
              Checking subscription...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-card border rounded-lg">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <div>
            <span className="font-medium text-sm">
              {getPlanDisplayName(planName)}
            </span>
            {planName !== 'none' && (
              <span className="text-xs text-muted-foreground ml-2">
                {getPlanPrice(planName)}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={getStatusColor()} className="text-xs">
            {error ? 'Error' : status}
          </Badge>
          {showManageButton && isActive && (
            <Button
              onClick={openCustomerPortal}
              variant="outline"
              size="sm"
            >
              Manage
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription Status
          </div>
          <Button
            onClick={refreshSubscription}
            variant="ghost"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Plan:</span>
          <div className="flex items-center gap-2">
            <span className="font-medium">{getPlanDisplayName(planName)}</span>
            <Badge variant={getStatusColor()}>
              {error ? 'Error' : status}
            </Badge>
          </div>
        </div>

        {planName !== 'none' && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Price:</span>
            <span className="font-medium">{getPlanPrice(planName)}</span>
          </div>
        )}

        {expiryDate && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Next billing:</span>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span className="text-sm font-medium">
                {expiryDate.toLocaleDateString()}
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="pt-2 space-y-2">
          {!isActive && (
            <Button
              onClick={() => navigate('/subscribe')}
              className="w-full"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Subscribe Now
            </Button>
          )}
          
          {showManageButton && isActive && (
            <Button
              onClick={openCustomerPortal}
              variant="outline"
              className="w-full"
            >
              <Settings className="h-4 w-4 mr-2" />
              Manage Subscription
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionStatus;