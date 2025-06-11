
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import BitcoinWalletPage from "./pages/BitcoinWalletPage";
import StripePaymentPage from "./pages/StripePaymentPage";
import AccountSetupSuccess from "./pages/AccountSetupSuccess";
import AccountSetupCancelled from "./pages/AccountSetupCancelled";
import AccountSetupSimulation from "./pages/AccountSetupSimulation";
import WithdrawalSuccess from "./pages/WithdrawalSuccess";
import WithdrawalCancelled from "./pages/WithdrawalCancelled";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
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
          <Route path="/account-setup-success" element={<AccountSetupSuccess />} />
          <Route path="/account-setup-cancelled" element={<AccountSetupCancelled />} />
          <Route path="/account-setup-simulation" element={<AccountSetupSimulation />} />
          <Route path="/withdrawal-success" element={<WithdrawalSuccess />} />
          <Route path="/withdrawal-cancelled" element={<WithdrawalCancelled />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
