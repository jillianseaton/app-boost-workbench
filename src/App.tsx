import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Index from '@/pages/Index';
import Dashboard from '@/components/Dashboard';
import LoginSignup from '@/components/LoginSignup';
import { useAuth } from '@/hooks/useAuth';
import AdRevenuePage from '@/pages/AdRevenuePage';
import { QueryClient } from 'react-query';
import SecureBankTransferPage from '@/pages/SecureBankTransferPage';

function App() {
  return (
    <QueryClient>
      <BrowserRouter>
        <Toaster />
        <Routes>
          <Route path="/" element={<Index />} />
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
        </Routes>
      </BrowserRouter>
    </QueryClient>
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
          <LoginSignup />
        </div>
      </div>
    );
  }

  return children;
}

export default App;
