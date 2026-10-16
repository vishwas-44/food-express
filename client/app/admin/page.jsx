'use client';

import { useContext, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import { MyContext } from '../../context/ThemeContext';

import {
  MdCategory,
  MdFastfood,
  MdListAlt,
  MdHistory,
  MdShoppingBag,
  MdPending,
  MdRestaurant,
  MdDeliveryDining,
  MdCheckCircle,
  MdCancel,
  MdCurrencyRupee,
  MdLocalOffer,
} from 'react-icons/md';

export default function AdminDashboard() {
  const context = useContext(MyContext);
  const user = context?.userDetails;

  const [checkingAccess, setCheckingAccess] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState('');

  /*
    Check admin access
  */
  useEffect(() => {
    if (!context?.isLoggedIn) {
      setAccessDenied(true);
      setCheckingAccess(false);
      return;
    }

    if (user?.role !== 'Admin') {
      setAccessDenied(true);
      setCheckingAccess(false);
      return;
    }

    setAccessDenied(false);
    setCheckingAccess(false);
  }, [context?.isLoggedIn, user]);

  /*
    Fetch orders
  */
  useEffect(() => {
    if (checkingAccess || accessDenied) {
      return;
    }

    let isMounted = true;

    const fetchOrders = async () => {
      try {
        const response = await fetch(
          'http://localhost:8000/api/admin/all-orders',
          {
            method: 'GET',
            credentials: 'include',
          }
        );

        const data = await response.json();

        if (!response.ok) {
          if (isMounted) {
            setError(data.message || 'Failed to fetch orders.');
          }
          return;
        }

        if (isMounted) {
          setOrders(data.data || []);
          setError('');
        }
      } catch (error) {
        console.error('Dashboard orders error:', error);

        if (isMounted) {
          setError('Unable to connect to the server.');
        }
      } finally {
        if (isMounted) {
          setLoadingOrders(false);
        }
      }
    };

    fetchOrders();

    /*
      Refresh dashboard every 5 seconds
    */
    const interval = setInterval(fetchOrders, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [checkingAccess, accessDenied]);

  /*
    Date helpers
  */
  const getLocalDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const getDateKey = (dateString) => {
    if (!dateString) {
      return '';
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return getLocalDateKey(date);
  };

  const todayKey = getLocalDateKey(new Date());

  /*
    Get start and end of current week
  */
  const getCurrentWeekRange = () => {
    const today = new Date();
    const day = today.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;

    const start = new Date(today);

    start.setDate(today.getDate() + mondayOffset);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);

    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  };

  /*
    Get current month range
  */
  const getCurrentMonthRange = () => {
    const today = new Date();

    const start = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    start.setHours(0, 0, 0, 0);

    const end = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    );

    end.setHours(23, 59, 59, 999);

    return { start, end };
  };

  const isInsideRange = (dateString, start, end) => {
    if (!dateString) {
      return false;
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return false;
    }

    return date >= start && date <= end;
  };

  /*
    Today's orders
  */
  const todayOrders = useMemo(() => {
    return orders.filter(
      (order) => getDateKey(order.created_at) === todayKey
    );
  }, [orders, todayKey]);

  /*
    Current week
  */
  const weekRange = useMemo(
    () => getCurrentWeekRange(),
    []
  );

  const weekOrders = useMemo(() => {
    return orders.filter((order) =>
      isInsideRange(
        order.created_at,
        weekRange.start,
        weekRange.end
      )
    );
  }, [orders, weekRange]);

  /*
    Current month
  */
  const monthRange = useMemo(
    () => getCurrentMonthRange(),
    []
  );

  const monthOrders = useMemo(() => {
    return orders.filter((order) =>
      isInsideRange(
        order.created_at,
        monthRange.start,
        monthRange.end
      )
    );
  }, [orders, monthRange]);

  /*
    Normalize status
  */
  const getStatus = (order) =>
    String(order.order_status || '')
      .trim()
      .toLowerCase();

  /*
    Today's Processing
  */
  const processingToday = todayOrders.filter((order) => {
    const status = getStatus(order);

    return status === 'processing' || status === 'confirmed';
  });

  /*
    Today's Preparing
  */
  const preparingToday = todayOrders.filter((order) => {
    const status = getStatus(order);

    return status === 'preparing' || status === 'prepared';
  });

  /*
    Today's Out for Delivery
  */
  const outForDeliveryToday = todayOrders.filter((order) => {
    const status = getStatus(order);

    return (
      status === 'out for delivery' ||
      status === 'out_for_delivery' ||
      status === 'shipped'
    );
  });

  /*
    Today's Delivered
  */
  const deliveredToday = todayOrders.filter((order) => {
    const status = getStatus(order);

    return status === 'delivered' || status === 'completed';
  });

  /*
    Today's Cancelled
  */
  const cancelledToday = todayOrders.filter(
    (order) => getStatus(order) === 'cancelled'
  );

  /*
    Calculate sales
  */
  const calculateSales = (orderList) => {
    return orderList.reduce((total, order) => {
      const status = getStatus(order);

      /*
        Cancelled orders are not counted
        as completed sales.
      */
      if (status === 'cancelled') {
        return total;
      }

      return total + Number(order.total_amount || 0);
    }, 0);
  };

  const todaySales = calculateSales(todayOrders);
  const weekSales = calculateSales(weekOrders);
  const monthSales = calculateSales(monthOrders);

  /*
    Format money
  */
  const formatMoney = (amount) =>
    `₹${Number(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  /*
    Checking access
  */
  if (checkingAccess) {
    return (
      <div>
        <h1>Checking Admin Access...</h1>
        <p style={{ color: '#666' }}>Please wait.</p>
      </div>
    );
  }

  /*
    Access denied
  */
  if (accessDenied) {
    return (
      <div
        style={{
          background: '#fff',
          border: '1px solid #ddd',
          borderRadius: '12px',
          padding: '50px',
          textAlign: 'center',
        }}
      >
        <h1>Access Denied</h1>

        <p
          style={{
            color: '#666',
            marginTop: '10px',
          }}
        >
          Admin privileges are required to access this page.
        </p>

        <Link
          href="/"
          style={{
            display: 'inline-block',
            marginTop: '20px',
            padding: '12px 25px',
            background: '#ff5722',
            color: '#fff',
            borderRadius: '7px',
            textDecoration: 'none',
            fontWeight: 'bold',
          }}
        >
          Go Home
        </Link>
      </div>
    );
  }

  /*
    Dashboard
  */
  return (
    <div
      style={{
        maxWidth: '1400px',
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '20px',
          flexWrap: 'wrap',
          marginBottom: '30px',
        }}
      >
        <div>
          <h1 style={{ marginBottom: '8px' }}>
            Admin Dashboard
          </h1>

          <p
            style={{
              color: '#666',
              margin: 0,
            }}
          >
            Overview of your food ordering business.
          </p>
        </div>

        <div
          style={{
            background: '#e8f5e9',
            color: '#2e7d32',
            border: '1px solid #a5d6a7',
            borderRadius: '20px',
            padding: '9px 16px',
            fontSize: '13px',
            fontWeight: '600',
          }}
        >
          ● Live Dashboard
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            background: '#ffebee',
            color: '#c62828',
            border: '1px solid #ef9a9a',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px',
          }}
        >
          {error}
        </div>
      )}

      {/* Today's Overview */}
      <h2
        style={{
          marginBottom: '15px',
          fontSize: '22px',
        }}
      >
        Today&apos;s Overview
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '15px',
          marginBottom: '35px',
        }}
      >
        {/* Total Orders */}
        <DashboardCard
          title="Today's Orders"
          value={todayOrders.length}
          description="Orders received today"
          icon={MdShoppingBag}
          iconBackground="#fff3e0"
          iconColor="#ef6c00"
        />

        {/* Processing */}
        <DashboardCard
          title="Processing"
          value={processingToday.length}
          description="Processing / confirmed"
          icon={MdPending}
          iconBackground="#e3f2fd"
          iconColor="#1565c0"
        />

        {/* Preparing */}
        <DashboardCard
          title="Preparing"
          value={preparingToday.length}
          description="Being prepared"
          icon={MdRestaurant}
          iconBackground="#fff8e1"
          iconColor="#ef6c00"
        />

        {/* Out for Delivery */}
        <DashboardCard
          title="Out for Delivery"
          value={outForDeliveryToday.length}
          description="Orders on the way"
          icon={MdDeliveryDining}
          iconBackground="#f3e5f5"
          iconColor="#6a1b9a"
        />

        {/* Delivered */}
        <DashboardCard
          title="Delivered"
          value={deliveredToday.length}
          description="Completed today"
          icon={MdCheckCircle}
          iconBackground="#e8f5e9"
          iconColor="#2e7d32"
        />

        {/* Cancelled */}
        <DashboardCard
          title="Cancelled"
          value={cancelledToday.length}
          description="Cancelled today"
          icon={MdCancel}
          iconBackground="#ffebee"
          iconColor="#c62828"
        />
      </div>

      {/* Sales Overview */}
      <h2
        style={{
          marginBottom: '15px',
          fontSize: '22px',
        }}
      >
        Sales Overview
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '15px',
          marginBottom: '35px',
        }}
      >
        {/* Today */}
        <SalesCard
          title="Today's Sales"
          amount={todaySales}
          description="Sales generated today"
        />

        {/* Week */}
        <SalesCard
          title="This Week"
          amount={weekSales}
          description={`${weekOrders.length} orders this week`}
        />

        {/* Month */}
        <SalesCard
          title="This Month"
          amount={monthSales}
          description={`${monthOrders.length} orders this month`}
        />
      </div>

      {/* Quick Actions */}
      <h2
        style={{
          marginBottom: '15px',
          fontSize: '22px',
        }}
      >
        Quick Actions
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '15px',
          marginBottom: '35px',
        }}
      >
        {/* All Orders */}
        <QuickAction
          href="/admin/orders"
          icon={MdListAlt}
          title="All Orders"
          description="Manage current customer orders"
        />

        {/* Order History */}
        <QuickAction
          href="/admin/order-history"
          icon={MdHistory}
          title="Order History"
          description="View previous orders and statistics"
        />

        {/* Add Product */}
        <QuickAction
          href="/admin/add-product"
          icon={MdFastfood}
          title="Add Product"
          description="Add a new food item"
        />

        {/* Add Category */}
        <QuickAction
          href="/admin/add-category"
          icon={MdCategory}
          title="Add Category"
          description="Create a food category"
        />

        {/* Manage Coupons */}
        <QuickAction
          href="/admin/coupons"
          icon={MdLocalOffer}
          title="Manage Coupons"
          description="Create discounts and manage promotional codes"
        />
      </div>

      {/* Information */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #ddd',
          borderRadius: '12px',
          padding: '22px',
        }}
      >
        <h3
          style={{
            marginTop: 0,
            marginBottom: '10px',
          }}
        >
          Dashboard Information
        </h3>

        <p
          style={{
            color: '#666',
            lineHeight: '1.7',
            margin: 0,
          }}
        >
          This dashboard updates automatically every 5 seconds.
          Current orders are managed from All Orders, while
          completed and cancelled orders can be reviewed in
          Order History.
        </p>
      </div>
    </div>
  );
}

/*
  Dashboard statistic card
*/
function DashboardCard({
  title,
  value,
  description,
  icon: Icon,
  iconBackground,
  iconColor,
}) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #ddd',
        borderRadius: '14px',
        padding: '20px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '10px',
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              color: '#666',
              fontSize: '14px',
              fontWeight: '600',
            }}
          >
            {title}
          </p>

          <h2
            style={{
              margin: '10px 0 5px',
              fontSize: '34px',
            }}
          >
            {value}
          </h2>
        </div>

        <div
          style={{
            width: '55px',
            height: '55px',
            borderRadius: '14px',
            background: iconBackground,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon
            style={{
              fontSize: '30px',
              color: iconColor,
            }}
          />
        </div>
      </div>

      <p
        style={{
          margin: '5px 0 0',
          color: '#777',
          fontSize: '12px',
        }}
      >
        {description}
      </p>
    </div>
  );
}

/*
  Sales card
*/
function SalesCard({
  title,
  amount,
  description,
}) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #ddd',
        borderRadius: '14px',
        padding: '25px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '8px',
        }}
      >
        <MdCurrencyRupee
          style={{
            fontSize: '22px',
            color: '#ff5722',
          }}
        />

        <span
          style={{
            color: '#666',
            fontWeight: '600',
          }}
        >
          {title}
        </span>
      </div>

      <h2
        style={{
          margin: '5px 0 8px',
          fontSize: '30px',
        }}
      >
        {Number(amount || 0).toLocaleString('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 2,
        })}
      </h2>

      <p
        style={{
          margin: 0,
          color: '#777',
          fontSize: '13px',
        }}
      >
        {description}
      </p>
    </div>
  );
}

/*
  Quick action card
*/
function QuickAction({
  href,
  icon: Icon,
  title,
  description,
}) {
  return (
    <Link
      href={href}
      style={{
        background: '#fff',
        border: '1px solid #ddd',
        borderRadius: '12px',
        padding: '20px',
        textDecoration: 'none',
        color: '#222',
        transition: 'transform 0.2s ease',
      }}
    >
      <Icon
        style={{
          fontSize: '38px',
          color: '#ff5722',
          marginBottom: '10px',
        }}
      />

      <h3
        style={{
          margin: '0 0 7px',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          color: '#666',
          margin: 0,
          fontSize: '13px',
          lineHeight: '1.5',
        }}
      >
        {description}
      </p>
    </Link>
  );
}