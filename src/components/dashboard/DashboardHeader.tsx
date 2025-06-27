
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Shield, Bitcoin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

interface DashboardHeaderProps {
  userEmail: string;
  onShowPrivacyPolicy: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  userEmail, 
  onShowPrivacyPolicy 
}) => {
  const { signOut } = useAuth();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>💸 Commission Payout Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/bitcoin-wallet">
              <Button variant="outline" size="sm">
                <Bitcoin className="h-4 w-4 mr-2" />
                Full Bitcoin Wallet
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onShowPrivacyPolicy}
            >
              <Shield className="h-4 w-4 mr-2" />
              Privacy Policy
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={signOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Signed in as: <span className="font-medium">{userEmail}</span>
        </p>
      </CardContent>
    </Card>
  );
};

export default DashboardHeader;
