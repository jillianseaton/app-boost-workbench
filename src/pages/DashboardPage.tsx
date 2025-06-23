
import React from 'react';
import Dashboard from '@/components/Dashboard';

const DashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <Dashboard />
      </div>
    </div>
  );
};

export default DashboardPage;
