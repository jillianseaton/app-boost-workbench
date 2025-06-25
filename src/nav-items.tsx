
import { HomeIcon, Users, CreditCard, Settings, Shield, TrendingUp, Banknote, Bitcoin, FileText, Info, Phone, TestTube } from "lucide-react";
import Index from "./pages/Index";
import DashboardPage from "./pages/DashboardPage";
import PaymentPage from "./pages/PaymentPage";
import StripeTestPage from "./pages/StripeTestPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import Auth from "./pages/Auth";
import AdRevenuePage from "./pages/AdRevenuePage";
import AffiliateRevenuePage from "./pages/AffiliateRevenuePage";
import SecureBankTransferPage from "./pages/SecureBankTransferPage";
import BitcoinWalletPage from "./pages/BitcoinWalletPage";
import BalanceTransactionsPage from "./pages/BalanceTransactionsPage";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ProductionTestPage from "./pages/ProductionTestPage";
import NotFound from "./pages/NotFound";

export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Auth",
    to: "/auth",
    icon: <Users className="h-4 w-4" />,
    page: <Auth />,
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
    title: "Ad Revenue",
    to: "/ad-revenue",
    icon: <TrendingUp className="h-4 w-4" />,
    page: <AdRevenuePage />,
  },
  {
    title: "Affiliate Revenue",
    to: "/affiliate-revenue",
    icon: <TrendingUp className="h-4 w-4" />,
    page: <AffiliateRevenuePage />,
  },
  {
    title: "Secure Bank Transfer",
    to: "/secure-bank-transfer",
    icon: <Banknote className="h-4 w-4" />,
    page: <SecureBankTransferPage />,
  },
  {
    title: "Bitcoin Wallet",
    to: "/bitcoin-wallet",
    icon: <Bitcoin className="h-4 w-4" />,
    page: <BitcoinWalletPage />,
  },
  {
    title: "Balance Transactions",
    to: "/balance-transactions",
    icon: <FileText className="h-4 w-4" />,
    page: <BalanceTransactionsPage />,
  },
  {
    title: "About",
    to: "/about",
    icon: <Info className="h-4 w-4" />,
    page: <About />,
  },
  {
    title: "Contact",
    to: "/contact",
    icon: <Phone className="h-4 w-4" />,
    page: <Contact />,
  },
  {
    title: "Production Test",
    to: "/production-test",
    icon: <TestTube className="h-4 w-4" />,
    page: <ProductionTestPage />,
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
  {
    title: "Not Found",
    to: "*",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <NotFound />,
  },
];
