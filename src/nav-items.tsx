
import { HomeIcon, CreditCard, DollarSign, Users, Settings, LogIn } from "lucide-react";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import DashboardPage from "@/pages/DashboardPage";
import PaymentPage from "@/pages/PaymentPage";
import About from "@/pages/About";
import Contact from "@/pages/Contact";

/**
 * Central place for defining the navigation items. Used for navigation components and routing.
 */
export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Sign In",
    to: "/auth",
    icon: <LogIn className="h-4 w-4" />,
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
    title: "About",
    to: "/about",
    icon: <Settings className="h-4 w-4" />,
    page: <About />,
  },
  {
    title: "Contact",
    to: "/contact",
    icon: <DollarSign className="h-4 w-4" />,
    page: <Contact />,
  },
];
