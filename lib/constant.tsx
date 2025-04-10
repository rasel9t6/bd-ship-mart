import {
  LayoutDashboard,
  Shapes,
  ShoppingBag,
  Tag,
  UsersRound,
} from "lucide-react";

export const navLinks = [
  {
    url: "/admin",
    icon: <LayoutDashboard />,
    label: "Dashboard",
  },
  {
    url: "/admin/categories",
    icon: <Shapes />,
    label: "Categories",
  },
  {
    url: "/admin/products",
    icon: <Tag />,
    label: "Products",
  },
  {
    url: "/admin/orders",
    icon: <ShoppingBag />,
    label: "Orders",
  },
  {
    url: "/admin/customers",
    icon: <UsersRound />,
    label: "Customers",
  },
];
