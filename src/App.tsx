
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import Index from '@/pages/Index';
import Dashboard from '@/components/Dashboard';
import Auth from '@/pages/Auth';
import { useAuth } from '@/hooks/useAuth';
import AdRevenuePage from '@/pages/AdRevenuePage';
import SecureBankTransferPage from '@/pages/SecureBankTransferPage';
import AffiliateRevenuePage from '@/pages/AffiliateRevenuePage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route path="/ad-revenue" element={<AdRevenuePage />} />
          <Route path="/secure-bank-transfer" element={<SecureBankTransferPage />} />
          <Route path="/affiliate-revenue" element={<AffiliateRevenuePage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Dashboard Access
            </h1>
            <p className="text-gray-600">
              Please sign in to access the dashboard
            </p>
          </div>
          <Auth />
        </div>
      </div>
    );
  }

  return children;
}

export default App;
