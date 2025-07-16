import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import AdvancedAnalyticsDashboard from '@/components/analytics/AdvancedAnalyticsDashboard';

const AnalyticsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-7xl space-y-6">
        <div className="flex items-center gap-4">
          <Button onClick={() => navigate('/')} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold">Advanced Analytics Dashboard</h1>
        </div>
        
        <AdvancedAnalyticsDashboard />
      </div>
    </div>
  );
};

export default AnalyticsPage;