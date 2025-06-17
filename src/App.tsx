
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import BitcoinWalletPage from "./pages/BitcoinWalletPage";
import StripePaymentPage from "./pages/StripePaymentPage";
import StripeConnect from "./components/StripeConnect";
import StripeConnectLinkPage from "./pages/StripeConnectLinkPage";
import StripeConnectOAuthPage from "./pages/StripeConnectOAuthPage";
import DestinationCheckoutPage from "./pages/DestinationCheckoutPage";
import CustomStripeOnboardingPage from "./pages/CustomStripeOnboardingPage";
import AccountSetupSuccess from "./pages/AccountSetupSuccess";
import AccountSetupCancelled from "./pages/AccountSetupCancelled";
import AccountSetupSimulation from "./pages/AccountSetupSimulation";
import WithdrawalSuccess from "./pages/WithdrawalSuccess";
import WithdrawalCancelled from "./pages/WithdrawalCancelled";
import StripeTestPage from "./pages/StripeTestPage";
import EmbeddedCheckoutPage from "./pages/EmbeddedCheckoutPage";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import BalanceTransactionsPage from "./pages/BalanceTransactionsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/bitcoin-wallet" element={<BitcoinWalletPage />} />
            <Route path="/stripe-payment" element={<StripePaymentPage />} />
            <Route path="/stripe-connect" element={<StripeConnect />} />
            <Route path="/stripe-connect-link" element={<StripeConnectLinkPage />} />
            <Route path="/stripe-connect-oauth" element={<StripeConnectOAuthPage />} />
            <Route path="/stripe-test" element={<StripeTestPage />} />
            <Route path="/destination-checkout" element={<DestinationCheckoutPage />} />
            <Route path="/custom-stripe-onboarding" element={<CustomStripeOnboardingPage />} />
            <Route path="/account-setup-success" element={<AccountSetupSuccess />} />
            <Route path="/account-setup-cancelled" element={<AccountSetupCancelled />} />
            <Route path="/account-setup-simulation" element={<AccountSetupSimulation />} />
            <Route path="/withdrawal-success" element={<WithdrawalSuccess />} />
            <Route path="/withdrawal-cancelled" element={<WithdrawalCancelled />} />
            <Route path="/balance-transactions" element={<BalanceTransactionsPage />} />
            <Route path="/checkout/:priceId" element={<EmbeddedCheckoutPage />} />
            <Route path="/subscription-success" element={<SubscriptionSuccess />} />
            <Route path="/ad-revenue" element={<AdRevenuePage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
