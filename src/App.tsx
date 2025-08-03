
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";
import Index from "./pages/Index";
import StripeExpressPage from "./pages/StripeExpressPage";
import PaymentIntentPage from "./pages/PaymentIntentPage";
import { SupabaseRealtimeListener } from "@/components/SupabaseRealtimeListener";
import AutoLogUUID from "@/components/AutoLogUUID";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SupabaseRealtimeListener />
      <AutoLogUUID />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/stripe-express" element={<StripeExpressPage />} />
          <Route path="/payment-intent" element={<PaymentIntentPage />} />
          {navItems.map(({ to, page }) => (
            <Route key={to} path={to} element={page} />
          ))}
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
