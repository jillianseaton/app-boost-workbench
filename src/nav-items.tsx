
import { HomeIcon, Users, CreditCard, Settings, Shield } from "lucide-react";
import Index from "./pages/Index";
import DashboardPage from "./pages/DashboardPage";
import PaymentPage from "./pages/PaymentPage";
import StripeTestPage from "./pages/StripeTestPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";

export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Dashboard",
    to: "/dashboard",
    icon: <Users className="h-4 w-4" />,
    page: <DashboardPage />,
  },
  {
    title: "Payment",
    to: "/payment",
    icon: <CreditCard className="h-4 w-4" />,
    page: <PaymentPage />,
  },
  {
    title: "Stripe Test",
    to: "/stripe-test",
    icon: <Settings className="h-4 w-4" />,
    page: <StripeTestPage />,
  },
  {
    title: "Privacy Policy",
    to: "/privacy-policy",
    icon: <Shield className="h-4 w-4" />,
    page: <PrivacyPolicyPage />,
  },
];
