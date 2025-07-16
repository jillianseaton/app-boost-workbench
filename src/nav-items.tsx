
import { HomeIcon, Wallet, Bitcoin, DollarSign, TrendingUp, Shield, CreditCard, Users, BarChart3, Settings, Target } from "lucide-react";
import Index from "./pages/Index";
import DashboardPage from "./pages/DashboardPage";
import AdRevenuePage from "./pages/AdRevenuePage";
import AffiliateRevenuePage from "./pages/AffiliateRevenuePage";
import BitcoinWalletPage from "./pages/BitcoinWalletPage";
import DecentralizedWalletPage from "./pages/DecentralizedWalletPage";
import EVMWalletPage from "./pages/EVMWalletPage";
import SecureBankTransferPage from "./pages/SecureBankTransferPage";
import Auth from "./pages/Auth";
import PaymentPage from "./pages/PaymentPage";
import EmbeddedCheckoutPage from "./pages/EmbeddedCheckoutPage";
import StripePaymentPage from "./pages/StripePaymentPage";
import PayoutIntegrationPage from "./pages/PayoutIntegrationPage";
import DestinationCheckoutPage from "./pages/DestinationCheckoutPage";
import StripeConnectLinkPage from "./pages/StripeConnectLinkPage";
import StripeConnectOAuthPage from "./pages/StripeConnectOAuthPage";
import CustomStripeOnboardingPage from "./pages/CustomStripeOnboardingPage";
import StripeTestPage from "./pages/StripeTestPage";
import ProductionTestPage from "./pages/ProductionTestPage";
import BalanceTransactionsPage from "./pages/BalanceTransactionsPage";
import AccountSetupSimulation from "./pages/AccountSetupSimulation";
import AccountSetupSuccess from "./pages/AccountSetupSuccess";
import AccountSetupCancelled from "./pages/AccountSetupCancelled";
import WithdrawalSuccess from "./pages/WithdrawalSuccess";
import WithdrawalCancelled from "./pages/WithdrawalCancelled";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import Contact from "./pages/Contact";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import OptimizationServices from "./pages/OptimizationServices";
import SubscriptionPurchasePage from "./pages/SubscriptionPurchasePage";

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
    icon: <BarChart3 className="h-4 w-4" />,
    page: <DashboardPage />,
  },
  {
    title: "Ad Revenue",
    to: "/ad-revenue",
    icon: <DollarSign className="h-4 w-4" />,
    page: <AdRevenuePage />,
  },
  {
    title: "Affiliate Revenue",
    to: "/affiliate-revenue",
    icon: <TrendingUp className="h-4 w-4" />,
    page: <AffiliateRevenuePage />,
  },
  {
    title: "Bitcoin Wallet",
    to: "/bitcoin-wallet",
    icon: <Bitcoin className="h-4 w-4" />,
    page: <BitcoinWalletPage />,
  },
  {
    title: "EVM Networks",
    to: "/evm-wallet",
    icon: <Wallet className="h-4 w-4" />,
    page: <EVMWalletPage />,
  },
  {
    title: "Decentralized Wallet",
    to: "/decentralized-wallet",
    icon: <Wallet className="h-4 w-4" />,
    page: <DecentralizedWalletPage />,
  },
  {
    title: "Secure Bank Transfer",
    to: "/secure-bank-transfer",
    icon: <Shield className="h-4 w-4" />,
    page: <SecureBankTransferPage />,
  },
  {
    title: "Auth",
    to: "/auth",
    icon: <Users className="h-4 w-4" />,
    page: <Auth />,
  },
  {
    title: "Payment",
    to: "/payment",
    icon: <CreditCard className="h-4 w-4" />,
    page: <PaymentPage />,
  },
  {
    title: "Embedded Checkout",
    to: "/embedded-checkout",
    icon: <CreditCard className="h-4 w-4" />,
    page: <EmbeddedCheckoutPage />,
  },
  {
    title: "Stripe Payment",
    to: "/stripe-payment",
    icon: <CreditCard className="h-4 w-4" />,
    page: <StripePaymentPage />,
  },
  {
    title: "Payout Integration",
    to: "/payout-integration",
    icon: <DollarSign className="h-4 w-4" />,
    page: <PayoutIntegrationPage />,
  },
  {
    title: "Destination Checkout",
    to: "/destination-checkout",
    icon: <CreditCard className="h-4 w-4" />,
    page: <DestinationCheckoutPage />,
  },
  {
    title: "Stripe Connect Link",
    to: "/stripe-connect-link",
    icon: <Settings className="h-4 w-4" />,
    page: <StripeConnectLinkPage />,
  },
  {
    title: "Stripe Connect OAuth",
    to: "/stripe-connect-oauth",
    icon: <Settings className="h-4 w-4" />,
    page: <StripeConnectOAuthPage />,
  },
  {
    title: "Custom Stripe Onboarding",
    to: "/custom-stripe-onboarding",
    icon: <Settings className="h-4 w-4" />,
    page: <CustomStripeOnboardingPage />,
  },
  {
    title: "Stripe Test",
    to: "/stripe-test",
    icon: <Settings className="h-4 w-4" />,
    page: <StripeTestPage />,
  },
  {
    title: "Production Test",
    to: "/production-test",
    icon: <Settings className="h-4 w-4" />,
    page: <ProductionTestPage />,
  },
  {
    title: "Balance Transactions",
    to: "/balance-transactions",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <BalanceTransactionsPage />,
  },
  {
    title: "Account Setup Simulation",
    to: "/account-setup-simulation",
    icon: <Settings className="h-4 w-4" />,
    page: <AccountSetupSimulation />,
  },
  {
    title: "Account Setup Success",
    to: "/account-setup-success",
    icon: <Settings className="h-4 w-4" />,
    page: <AccountSetupSuccess />,
  },
  {
    title: "Account Setup Cancelled",
    to: "/account-setup-cancelled",
    icon: <Settings className="h-4 w-4" />,
    page: <AccountSetupCancelled />,
  },
  {
    title: "Withdrawal Success",
    to: "/withdrawal-success",
    icon: <DollarSign className="h-4 w-4" />,
    page: <WithdrawalSuccess />,
  },
  {
    title: "Withdrawal Cancelled",
    to: "/withdrawal-cancelled",
    icon: <DollarSign className="h-4 w-4" />,
    page: <WithdrawalCancelled />,
  },
  {
    title: "Subscription Success",
    to: "/subscription-success",
    icon: <CreditCard className="h-4 w-4" />,
    page: <SubscriptionSuccess />,
  },
  {
    title: "Contact",
    to: "/contact",
    icon: <Users className="h-4 w-4" />,
    page: <Contact />,
  },
  {
    title: "About",
    to: "/about",
    icon: <Settings className="h-4 w-4" />,
    page: <About />,
  },
  {
    title: "Privacy Policy",
    to: "/privacy-policy",
    icon: <Shield className="h-4 w-4" />,
    page: <PrivacyPolicyPage />,
  },
  {
    title: "404",
    to: "/404",
    icon: <Settings className="h-4 w-4" />,
    page: <NotFound />,
  },
  {
    title: "Optimization Services",
    to: "/optimization-services",
    icon: <Target className="h-4 w-4" />,
    page: <OptimizationServices />,
  },
  {
    title: "Subscribe",
    to: "/subscribe",
    icon: <CreditCard className="h-4 w-4" />,
    page: <SubscriptionPurchasePage />,
  },
];
