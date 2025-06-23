
import { Home, CreditCard, LayoutDashboard } from "lucide-react";
import Index from "./pages/Index";
import PaymentPage from "./pages/PaymentPage";
import DashboardPage from "./pages/DashboardPage";

export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: <Home className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Make Payment",
    to: "/payment",
    icon: <CreditCard className="h-4 w-4" />,
    page: <PaymentPage />,
  },
  {
    title: "Dashboard",
    to: "/dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
    page: <DashboardPage />,
  },
];
