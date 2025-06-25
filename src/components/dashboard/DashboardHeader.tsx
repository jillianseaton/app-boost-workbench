
import React from 'react';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';
import GoogleAuth from '@/components/GoogleAuth';

interface DashboardHeaderProps {
  userEmail: string;
  onShowPrivacyPolicy: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userEmail,
  onShowPrivacyPolicy
}) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {userEmail}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onShowPrivacyPolicy}
          className="flex items-center gap-2"
        >
          <Shield className="h-4 w-4" />
          Privacy Policy
        </Button>
        <GoogleAuth />
      </div>
    </div>
  );
};

export default DashboardHeader;
