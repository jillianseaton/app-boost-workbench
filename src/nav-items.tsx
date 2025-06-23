
import { Home, CreditCard } from "lucide-react";
import Index from "./pages/Index";
import PaymentPage from "./pages/PaymentPage";

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
];
