import {
  LayoutDashboard,
  Shapes,
  ShoppingBag,
  Tag,
  UsersRound,
} from 'lucide-react';

export const navLinks = [
  {
    url: '/admin',
    icon: <LayoutDashboard className='hover:text-bondi-blue-100' />,
    label: 'Dashboard',
  },
  {
    url: '/admin/categories',
    icon: <Shapes className='hover:text-bondi-blue-100' />,
    label: 'Categories',
  },
  {
    url: '/admin/products',
    icon: <Tag className='hover:text-bondi-blue-100' />,
    label: 'Products',
  },
  {
    url: '/admin/orders',
    icon: <ShoppingBag className='hover:text-bondi-blue-100' />,
    label: 'Orders',
  },
  {
    url: '/admin/customers',
    icon: <UsersRound className='hover:text-bondi-blue-100' />,
    label: 'Customers',
  },
];
