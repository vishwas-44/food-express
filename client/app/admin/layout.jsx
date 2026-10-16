'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  MdDashboard,
  MdCategory,
  MdFastfood,
  MdListAlt,
  MdEdit,
  MdFolderSpecial,
  MdHistory,
  MdLocalOffer,
} from 'react-icons/md';

const navItems = [
  {
    label: 'All Orders',
    href: '/admin/orders',
    icon: MdListAlt,
  },
  {
    label: 'Order History',
    href: '/admin/order-history',
    icon: MdHistory,
  },
  {
    label: 'Dashboard',
    href: '/admin',
    icon: MdDashboard,
  },
  {
    label: 'Add Category',
    href: '/admin/add-category',
    icon: MdCategory,
  },
  {
    label: 'Manage Categories',
    href: '/admin/categories',
    icon: MdFolderSpecial,
  },
  {
    label: 'Add Product',
    href: '/admin/add-product',
    icon: MdFastfood,
  },
  {
    label: 'Manage Products',
    href: '/admin/products',
    icon: MdEdit,
  },
  {
    label: 'Manage Coupons',
    href: '/admin/coupons',
    icon: MdLocalOffer,
  },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f7f7f7',
        paddingTop: '80px',
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          position: 'fixed',
          top: '80px',
          left: 0,
          width: '250px',
          height: 'calc(100vh - 80px)',
          background: '#1f1f1f',
          color: '#fff',
          padding: '25px 15px',
          overflowY: 'auto',
          zIndex: 1000,
          boxSizing: 'border-box',
        }}
      >
        {/* Sidebar Title */}
        <div
          style={{
            fontSize: '20px',
            fontWeight: 'bold',
            marginBottom: '30px',
            padding: '0 10px',
          }}
        >
          Admin Management
        </div>

        {/* Navigation */}
        <nav>
          {navItems.map((item) => {
            const Icon = item.icon;

            const isActive =
              pathname === item.href ||
              (item.href !== '/admin' &&
                pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '13px 12px',
                  marginBottom: '8px',
                  borderRadius: '7px',
                  textDecoration: 'none',
                  color: '#fff',
                  background: isActive
                    ? '#ff5722'
                    : 'transparent',
                  transition: 'background 0.2s ease',
                  cursor: 'pointer',
                }}
              >
                <Icon
                  style={{
                    fontSize: '22px',
                    flexShrink: 0,
                  }}
                />

                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main
        style={{
          marginLeft: '250px',
          padding: '30px',
          minHeight: 'calc(100vh - 80px)',
          boxSizing: 'border-box',
        }}
      >
        {children}
      </main>
    </div>
  );
}